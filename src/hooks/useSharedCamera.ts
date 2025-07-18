"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import CameraService from "@/services/CameraService";

export interface SharedCameraHook {
  stream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  isInitialized: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  toggleCamera: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  initialize: () => Promise<void>;
  cleanup: () => void;
}

export const useSharedCamera = (): SharedCameraHook => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState({
    isCameraOn: false,
    isMicOn: false,
    isInitialized: false,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraService = CameraService.getInstance();
  const cleanupTriggeredRef = useRef(false);

  const updateVideoElement = async (newStream: MediaStream | null) => {
    if (videoRef.current) {
      try {
        console.log("useSharedCamera: Updating video element", {
          hasStream: !!newStream,
          isCameraEnabled: cameraService.isCameraEnabled(),
          videoElement: !!videoRef.current,
          videoTracks: newStream?.getVideoTracks().length || 0,
        });

        const video = videoRef.current;

        if (!video.paused) {
          video.pause();
        }
        video.srcObject = null;

        if (newStream && cameraService.isCameraEnabled()) {
          const videoTracks = newStream.getVideoTracks();

          if (videoTracks.length > 0) {
            console.log(
              "useSharedCamera: Setting video source with tracks:",
              videoTracks.length
            );

            video.srcObject = newStream;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;

            try {
              await video.play();
              console.log("useSharedCamera: Video playing successfully");
            } catch (playError: any) {
              if (playError.name !== "AbortError") {
                console.error("useSharedCamera: Play error:", playError);
              }
            }
          } else {
            console.log("useSharedCamera: No video tracks available");
          }
        } else {
          console.log("useSharedCamera: Camera disabled or no stream");
        }
      } catch (err) {
        console.error("useSharedCamera: Video element error:", err);
      }
    }
  };

  const updateCameraState = () => {
    const newState = {
      isCameraOn: cameraService.isCameraEnabled(),
      isMicOn: cameraService.isMicrophoneEnabled(),
      isInitialized: cameraService.isReady(),
    };
    console.log("useSharedCamera: State updated:", newState);
    setCameraState(newState);
  };

  // Cleanup function
  const cleanup = () => {
    if (!cleanupTriggeredRef.current) {
      console.log("useSharedCamera: Cleanup triggered");
      cleanupTriggeredRef.current = true;
      cameraService.forceStopAllTracks();
    }
  };

  useEffect(() => {
    console.log("useSharedCamera: Setting up subscriptions");

    const unsubscribeStream = cameraService.subscribe((newStream) => {
      console.log("useSharedCamera: Stream updated:", {
        hasStream: !!newStream,
        videoTracks: newStream?.getVideoTracks().length || 0,
        audioTracks: newStream?.getAudioTracks().length || 0,
        streamId: newStream?.id,
      });
      setStream(newStream);
      updateVideoElement(newStream);
    });

    const unsubscribeError = cameraService.subscribeToErrors((error) => {
      console.error("useSharedCamera: Error received:", error);
      setError(error);
    });

    const unsubscribeState = cameraService.subscribeToStateChanges(() => {
      console.log("useSharedCamera: State change notification received");
      updateCameraState();
    });

    updateCameraState();

    const currentStream = cameraService.getStream();
    if (currentStream) {
      console.log("useSharedCamera: Using existing stream");
      setStream(currentStream);
      updateVideoElement(currentStream);
    }

    // Cleanup on unmount
    return () => {
      console.log("useSharedCamera: Component unmounting, cleaning up...");
      unsubscribeStream();
      unsubscribeError();
      unsubscribeState();
      cleanup();
    };
  }, []);

  const toggleCamera = async () => {
    setError(null);
    console.log("useSharedCamera: Toggle camera requested");
    try {
      await cameraService.toggleCamera();
    } catch (err: any) {
      console.error("useSharedCamera: Toggle camera failed:", err);
      setError(err.message);
    }
  };

  const toggleMicrophone = async () => {
    setError(null);
    console.log("useSharedCamera: Toggle microphone requested");
    try {
      await cameraService.toggleMicrophone();
    } catch (err: any) {
      console.error("useSharedCamera: Toggle microphone failed:", err);
      setError(err.message);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setError(null);
    try {
      await cameraService.switchCamera(deviceId);
    } catch (err: any) {
      console.error("useSharedCamera: Switch camera failed:", err);
      setError(err.message);
    }
  };

  const initialize = async () => {
    setError(null);
    try {
      await cameraService.initialize();
    } catch (err: any) {
      console.error("useSharedCamera: Initialize failed:", err);
      setError(err.message);
    }
  };

  return {
    stream,
    isCameraOn: cameraState.isCameraOn,
    isMicOn: cameraState.isMicOn,
    isInitialized: cameraState.isInitialized,
    error,
    videoRef,
    toggleCamera,
    toggleMicrophone,
    switchCamera,
    initialize,
    cleanup,
  };
};
