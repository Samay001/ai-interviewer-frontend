"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { CameraHook } from "@/hooks/useCamera";
import type { AudioHook } from "@/hooks/useAudio";

interface UserVideoProps {
  camera: CameraHook;
  audio: AudioHook;
  currentSpeaker: "user" | "assistant" | null;
  isConnected: boolean;
  isCompact?: boolean;
  canToggleCamera?: boolean;
}

export const UserVideo: React.FC<UserVideoProps> = ({
  camera,
  audio,
  currentSpeaker,
  isConnected,
  isCompact = false,
  canToggleCamera = true,
}) => {
  const showVideoFeed =
    camera.isCameraOn && camera.stream && !camera.error && camera.isInitialized;

  return (
    <Card
      className={`bg-gray-900/50 border-gray-800 overflow-hidden transition-all duration-300 ${
        audio.isUserSpeaking && audio.isMicOn
          ? "ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10"
          : ""
      } ${isCompact ? "h-full" : ""}`}
    >
      <CardContent className="p-0 relative h-full flex flex-col">
        <div
          className={`bg-gray-900 relative overflow-hidden flex-1 ${
            isCompact ? "min-h-0" : "aspect-video"
          }`}
        >
          {/* Video element - always present */}
          <video
            ref={camera.videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              showVideoFeed ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: "scaleX(-1)" }}
            onLoadedData={() => console.log("Video loaded data")}
            onPlay={() => console.log("Video started playing")}
            onPause={() => console.log("Video paused")}
            onError={(e) => console.error("Video element error:", e)}
          />

          {/* Overlay when camera is off or error */}
          {!showVideoFeed && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div
                  className={`${
                    isCompact ? "w-12 h-12" : "w-20 h-20"
                  } rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4`}
                >
                  {camera.error ? (
                    <AlertCircle
                      className={`${
                        isCompact ? "w-6 h-6" : "w-10 h-10"
                      } text-red-500`}
                    />
                  ) : (
                    <User
                      className={`${
                        isCompact ? "w-6 h-6" : "w-10 h-10"
                      } text-gray-500`}
                    />
                  )}
                </div>
                <p
                  className={`text-gray-400 font-medium mb-2 ${
                    isCompact ? "text-sm" : ""
                  }`}
                >
                  {camera.error
                    ? "Camera Error"
                    : !camera.isCameraOn
                    ? "Camera is off"
                    : !camera.isInitialized
                    ? "Starting Camera..."
                    : "Loading..."}
                </p>
                {camera.error ? (
                  <div className="space-y-3">
                    <p
                      className={`text-gray-500 max-w-xs mx-auto ${
                        isCompact ? "text-xs" : "text-sm"
                      }`}
                    >
                      {camera.error}
                    </p>
                    <Button
                      onClick={camera.retryCamera}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Camera
                    </Button>
                  </div>
                ) : !camera.isCameraOn ? (
                  <p
                    className={`text-gray-500 ${
                      isCompact ? "text-xs" : "text-sm"
                    }`}
                  >
                    Click the camera button to turn on
                  </p>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span
                      className={`ml-2 text-gray-500 ${
                        isCompact ? "text-xs" : "text-sm"
                      }`}
                    >
                      Loading camera...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User speaking indicator */}
          {audio.isUserSpeaking && audio.isMicOn && (
            <div
              className={`absolute ${
                isCompact ? "top-2 left-2" : "top-4 left-4"
              } z-10`}
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(
                          8,
                          Math.min(20, 8 + audio.audioLevel / 5)
                        )}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <span
                  className={`text-blue-300 font-medium ${
                    isCompact ? "text-xs" : "text-sm"
                  }`}
                >
                  Speaking
                </span>
              </div>
            </div>
          )}

          {/* Connection status */}
          {camera.isInitialized && !camera.error && (
            <div
              className={`absolute ${
                isCompact ? "top-2 right-2" : "top-4 right-4"
              } z-10`}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse shadow-lg shadow-green-500/50" />
            </div>
          )}
        </div>

        {/* User controls */}
        <div
          className={`${
            isCompact ? "p-2" : "p-4"
          } bg-gray-900/90 backdrop-blur-sm border-t border-gray-800`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isCompact ? "w-8 h-8" : "w-10 h-10"
                } rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}
              >
                <User
                  className={`${isCompact ? "w-4 h-4" : "w-5 h-5"} text-white`}
                />
              </div>
              <div>
                <h3
                  className={`font-semibold text-white ${
                    isCompact ? "text-sm" : ""
                  }`}
                >
                  You
                </h3>
                <p
                  className={`text-gray-400 ${
                    isCompact ? "text-xs" : "text-sm"
                  }`}
                >
                  Interview Candidate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={camera.toggleCamera}
                disabled={
                  (!camera.isInitialized && !camera.error) || !canToggleCamera
                }
                className={`${
                  isCompact ? "p-2" : "p-3"
                } rounded-lg transition-all duration-200 ${
                  camera.isCameraOn && !camera.error
                    ? "text-white hover:bg-gray-700 bg-gray-800"
                    : "text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
                } ${!canToggleCamera ? "opacity-50 cursor-not-allowed" : ""}`}
                title={
                  !canToggleCamera
                    ? "Camera cannot be turned off during interview"
                    : ""
                }
              >
                {camera.isCameraOn && !camera.error ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={audio.toggleMicrophone}
                className={`${
                  isCompact ? "p-2" : "p-3"
                } rounded-lg transition-all duration-200 ${
                  audio.isMicOn
                    ? "text-white hover:bg-gray-700 bg-gray-800"
                    : "text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
                }`}
              >
                {audio.isMicOn ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  isCompact ? "p-2" : "p-3"
                } rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 bg-gray-800`}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
