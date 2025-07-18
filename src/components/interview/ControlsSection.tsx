"use client";

import type React from "react";
import { AlertTriangle, Camera, Mic } from "lucide-react";
import type { CameraHook } from "@/hooks/useCamera";
import type { AudioHook } from "@/hooks/useAudio";

interface ControlsSectionProps {
  isConnected: boolean;
  canStartInterview: boolean;
  camera: CameraHook;
  audio: AudioHook;
  isCompact?: boolean;
}

export const ControlsSection: React.FC<ControlsSectionProps> = ({
  isConnected,
  canStartInterview,
  camera,
  audio,
  isCompact = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Device status indicators */}
      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              camera.isCameraOn && camera.isInitialized && !camera.error
                ? "bg-green-500 shadow-lg shadow-green-500/50"
                : "bg-red-500"
            }`}
          />
          <Camera
            className={`w-3 h-3 ${
              camera.isCameraOn && camera.isInitialized && !camera.error
                ? "text-green-400"
                : "text-red-400"
            }`}
          />
          <span
            className={`font-medium ${
              camera.isCameraOn && camera.isInitialized && !camera.error
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            Camera{" "}
            {camera.isCameraOn && camera.isInitialized && !camera.error
              ? "Ready"
              : camera.error
              ? "Error"
              : "Off"}
          </span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              audio.isMicOn && audio.isInitialized
                ? "bg-green-500 shadow-lg shadow-green-500/50"
                : "bg-red-500"
            }`}
          />
          <Mic
            className={`w-3 h-3 ${
              audio.isMicOn && audio.isInitialized
                ? "text-green-400"
                : "text-red-400"
            }`}
          />
          <span
            className={`font-medium ${
              audio.isMicOn && audio.isInitialized
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            Microphone {audio.isMicOn && audio.isInitialized ? "Ready" : "Off"}
          </span>
        </div>

        {isConnected && (
          <>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-emerald-400 font-medium">
                Interview Active
              </span>
            </div>
          </>
        )}
      </div>

      {/* Setup requirements */}
      {!canStartInterview && !isConnected && (
        <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3 h-3" />
          <span>
            Please enable camera and microphone to start the interview
          </span>
        </div>
      )}
    </div>
  );
};
