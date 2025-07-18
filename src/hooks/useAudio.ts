"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface AudioHook {
  isMicOn: boolean;
  isInitialized: boolean;
  isUserSpeaking: boolean;
  audioLevel: number;
  toggleMicrophone: () => Promise<void>;
}

export const useAudio = (stream: MediaStream | null): AudioHook => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanupAudioContext = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, []);

  const initAudioAnalyser = useCallback(
    (mediaStream: MediaStream) => {
      try {
        console.log("useAudio: Initializing audio analyser...");

        cleanupAudioContext();

        const audioTracks = mediaStream.getAudioTracks();
        if (audioTracks.length === 0) {
          console.log("useAudio: No audio tracks available");
          return;
        }

        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        const source =
          audioContextRef.current.createMediaStreamSource(mediaStream);
        source.connect(analyserRef.current);

        const detectSpeech = () => {
          if (
            !analyserRef.current ||
            audioContextRef.current?.state === "closed"
          ) {
            return;
          }

          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          const speechThreshold = 15;

          const hasAudioTracks = mediaStream.getAudioTracks().length > 0;
          const shouldDetectSpeech =
            hasAudioTracks && average > speechThreshold;

          setIsUserSpeaking(shouldDetectSpeech);
          setAudioLevel(hasAudioTracks ? average : 0);
          setIsMicOn(hasAudioTracks);

          animationFrameRef.current = requestAnimationFrame(detectSpeech);
        };

        detectSpeech();
        setIsInitialized(true);
        console.log("useAudio: Audio analyser initialized successfully");
      } catch (err) {
        console.error("useAudio: Audio analyser error:", err);
      }
    },
    [cleanupAudioContext]
  );

  // Use shared camera service for microphone toggle
  const toggleMicrophone = useCallback(async () => {
    const CameraService = (await import("../services/CameraService")).default;
    const cameraService = CameraService.getInstance();
    await cameraService.toggleMicrophone();
  }, []);

  // Initialize when stream changes
  useEffect(() => {
    if (stream && stream.getAudioTracks().length > 0) {
      console.log("useAudio: Stream changed, initializing audio analyser");
      initAudioAnalyser(stream);
    } else {
      setIsUserSpeaking(false);
      setAudioLevel(0);
      setIsMicOn(false);
      setIsInitialized(false);
    }

    return cleanupAudioContext;
  }, [stream, initAudioAnalyser, cleanupAudioContext]);

  return {
    isMicOn,
    isInitialized,
    isUserSpeaking,
    audioLevel,
    toggleMicrophone,
  };
};
