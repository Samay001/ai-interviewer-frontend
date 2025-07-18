"use client";

import type React from "react";
import { Brain, Loader2, Mic, Video, Zap } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
  subMessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message,
  subMessage,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Main loading animation */}
        <div className="relative mb-8">
          {/* Central brain icon */}
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
              <Brain className="w-12 h-12 text-white" />
            </div>

            {/* Rotating rings */}
            <div
              className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-purple-400/30 animate-spin"
              style={{ animationDuration: "2s", animationDirection: "reverse" }}
            />
          </div>

          {/* Floating icons */}
          <div className="absolute -top-4 -left-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center animate-bounce">
              <Video className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="absolute -top-4 -right-4">
            <div
              className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              <Mic className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div
              className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-bounce"
              style={{ animationDelay: "1s" }}
            >
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            {message}
          </h2>

          {subMessage && <p className="text-gray-400 text-lg">{subMessage}</p>}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>

        {/* Setup steps */}
        <div className="mt-8 space-y-3 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Checking camera and microphone</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <span>Connecting to AI interviewer</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <span>Preparing interview session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
