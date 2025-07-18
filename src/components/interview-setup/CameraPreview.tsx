"use client";

import {
  Camera,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Settings,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CameraService from "@/services/CameraService";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
  isSpeaking: boolean;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  onSettingsClick: () => void;
}

const CameraPreview = ({
  videoRef,
  isCameraOn,
  isMicOn,
  isSpeaking,
  toggleCamera,
  toggleMicrophone,
  onSettingsClick,
}: CameraPreviewProps) => {
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [videoError, setVideoError] = useState<string | null>(null);

  // Debug video element state
  useEffect(() => {
    const updateDebugInfo = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        const stream = video.srcObject as MediaStream | null;

        const info = {
          hasVideoRef: !!videoRef.current,
          hasSrcObject: !!video.srcObject,
          videoTracks: stream?.getVideoTracks().length || 0,
          audioTracks: stream?.getAudioTracks().length || 0,
          videoReadyState: video.readyState,
          videoPlaying: !video.paused,
          videoMuted: video.muted,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          streamActive: stream?.active,
          streamId: stream?.id,
          isCameraOn,
          isMicOn,
          videoTracksState:
            stream?.getVideoTracks().map((t) => ({
              id: t.id,
              enabled: t.enabled,
              readyState: t.readyState,
            })) || [],
          audioTracksState:
            stream?.getAudioTracks().map((t) => ({
              id: t.id,
              enabled: t.enabled,
              readyState: t.readyState,
            })) || [],
        };

        setDebugInfo(JSON.stringify(info, null, 2));
      }
    };

    const interval = setInterval(updateDebugInfo, 2000);
    updateDebugInfo(); // Initial call

    return () => clearInterval(interval);
  }, [videoRef, isCameraOn, isMicOn]);

  const handleRetryVideo = async () => {
    setVideoError(null);
    if (videoRef.current) {
      try {
        console.log("CameraPreview: Retrying video playback");
        await videoRef.current.play();
      } catch (error) {
        console.error("CameraPreview: Retry failed:", error);
        setVideoError(`Retry failed: ${error}`);
      }
    }
  };

  const handleForceStop = () => {
    console.log("CameraPreview: Force stopping all camera/mic access");
    const cameraService = CameraService.getInstance();
    cameraService.forceStopAllTracks();
  };

  // Show video feed only if camera is on AND we have video tracks
  const stream = videoRef.current?.srcObject as MediaStream | null;
  const hasVideoTracks = (stream?.getVideoTracks()?.length ?? 0) > 0;
  const showVideoFeed = isCameraOn && hasVideoTracks && !videoError;

  console.log("CameraPreview render:", {
    isCameraOn,
    isMicOn,
    hasVideoTracks,
    showVideoFeed,
    streamId: stream?.id,
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Status Indicators */}
        <div className="flex justify-between items-center mb-4">
          <Badge
            variant="secondary"
            className={`transition-all duration-200 ${
              isCameraOn
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 transition-all duration-200 ${
                isCameraOn ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            {isCameraOn ? "Camera On" : "Camera Off"}
          </Badge>

          <Badge
            variant="secondary"
            className={`transition-all duration-200 ${
              isMicOn
                ? isSpeaking
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 transition-all duration-200 ${
                isMicOn
                  ? isSpeaking
                    ? "bg-green-500 animate-pulse"
                    : "bg-blue-500"
                  : "bg-red-500"
              }`}
            ></div>
            {isMicOn ? (isSpeaking ? "Speaking" : "Mic On") : "Mic Off"}
          </Badge>
        </div>

        {/* Video Preview */}
        <div className="relative bg-black rounded-xl overflow-hidden mb-6 aspect-video">
          {/* Always render video element */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${
              showVideoFeed ? "opacity-100" : "opacity-0"
            }`}
            onLoadedData={() => console.log("CameraPreview: Video loaded")}
            onPlay={() => console.log("CameraPreview: Video playing")}
            onError={(e) => {
              console.error("CameraPreview: Video error:", e);
              setVideoError("Video playback error");
            }}
          />

          {/* Overlay when camera is off or error */}
          {!showVideoFeed && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {videoError ? (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  ) : !isCameraOn ? (
                    <VideoOff className="w-8 h-8 text-red-500" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-muted-foreground font-medium mb-2">
                  {videoError
                    ? "Video Error"
                    : !isCameraOn
                    ? "Camera is turned off"
                    : "Loading camera..."}
                </p>
                {videoError ? (
                  <div className="space-y-2">
                    <p className="text-red-500 text-sm">{videoError}</p>
                    <Button
                      onClick={handleRetryVideo}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : !isCameraOn ? (
                  <p className="text-muted-foreground text-sm">
                    Click the camera button to turn on
                  </p>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Starting camera...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4">
            <Badge
              variant="secondary"
              className="bg-black/50 text-white border-0"
            >
              You
            </Badge>
          </div>

          {/* Debug info overlay (only in development) */}
          {/* {process.env.NODE_ENV === "development" && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs overflow-auto max-h-32">
              <pre>{debugInfo}</pre>
            </div>
          )} */}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={toggleCamera}
            variant={isCameraOn ? "secondary" : "destructive"}
            size="icon"
            className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-200 ${
              isCameraOn
                ? "hover:bg-secondary/80"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isCameraOn ? (
              <Camera className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>
          <Button
            onClick={toggleMicrophone}
            variant={
              isMicOn ? (isSpeaking ? "default" : "secondary") : "destructive"
            }
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-200 cursor-pointer ${
              isMicOn
                ? isSpeaking
                  ? "ring-2 ring-green-500/50 bg-green-500 hover:bg-green-600 text-white"
                  : "hover:bg-secondary/80"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isMicOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
          <Button
            onClick={onSettingsClick}
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Emergency Force Stop Button - for testing */}
          {/* {process.env.NODE_ENV === "development" && (
            <Button
              onClick={handleForceStop}
              variant="destructive"
              size="sm"
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              🚨 Force Stop All
            </Button>
          )} */}
        </div>

        {/* Debug panel for development */}
        {/* {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Debug Info
            </summary>
            <div className="mt-2 p-2 bg-muted rounded text-xs">
              <p>
                <strong>Camera On:</strong> {isCameraOn.toString()}
              </p>
              <p>
                <strong>Mic On:</strong> {isMicOn.toString()}
              </p>
              <p>
                <strong>Has Video Tracks:</strong> {hasVideoTracks.toString()}
              </p>
              <p>
                <strong>Show Video Feed:</strong> {showVideoFeed.toString()}
              </p>
              <p>
                <strong>Video Error:</strong> {videoError || "None"}
              </p>
              <p>
                <strong>Stream ID:</strong> {stream?.id || "None"}
              </p>
            </div>
          </details>
        )} */}
      </CardContent>
    </Card>
  );
};

export default CameraPreview;
