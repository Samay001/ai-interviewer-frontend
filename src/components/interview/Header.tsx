"use client";

import type React from "react";
import {
  AlertCircle,
  Phone,
  PhoneOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  isInitializing?: boolean;
  error: string | null;
  canStartInterview: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  cameraReady: boolean;
  micReady: boolean;
  isEnding?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  isConnecting = false,
  isInitializing = false,
  error,
  canStartInterview,
  onStartCall,
  onEndCall,
  cameraReady,
  micReady,
  isEnding = false,
}) => {
  const getStartButtonText = () => {
    if (isInitializing) return "Setting up...";
    if (isConnecting) return "Connecting...";
    if (!cameraReady && !micReady) return "Enable Camera & Mic";
    if (!cameraReady) return "Enable Camera";
    if (!micReady) return "Enable Microphone";
    return "Start AI Interview";
  };

  const getEndButtonText = () => {
    if (isEnding) return "Ending...";
    return "End Interview";
  };

  const isButtonLoading = isInitializing || isConnecting;
  const isButtonDisabled = !canStartInterview || isButtonLoading;
  const isEndButtonDisabled = isEnding;

  return (
    <div className="sticky top-0 z-50 border-b border-gray-800 px-6 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Interview Studio
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Next-generation AI-powered interview platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicators */}
          <div className="flex items-center gap-2">
            {!canStartInterview && !isConnected && !isButtonLoading && (
              <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 text-xs font-medium">
                  Setup Required
                </span>
              </div>
            )}

            {isConnected && !isEnding && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold">
                  Interview Live
                </span>
              </div>
            )}

            {isEnding && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg backdrop-blur-sm">
                <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
                <span className="text-orange-400 text-xs font-semibold">
                  Ending Interview...
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs font-medium">
                  {error}
                </span>
              </div>
            )}
          </div>

          {/* Main action button with integrated loading */}
          {!isConnected ? (
            <Button
              onClick={onStartCall}
              disabled={isButtonDisabled}
              size="lg"
              className={`cursor-pointer px-6 py-2 text-sm font-semibold transition-all duration-200 shadow-lg ${
                canStartInterview && !isButtonLoading
                  ? "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white hover:scale-105 shadow-emerald-600/20"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
            >
              {isButtonLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Phone className="w-4 h-4 mr-2" />
              )}
              {getStartButtonText()}
            </Button>
          ) : (
            <Button
              onClick={onEndCall}
              disabled={isEndButtonDisabled}
              size="lg"
              variant="destructive"
              className={`cursor-pointer px-6 py-2 text-sm font-semibold transition-all duration-200 shadow-lg ${
                isEndButtonDisabled
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover:scale-105 shadow-red-600/20"
              }`}
            >
              {isEnding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PhoneOff className="w-4 h-4 mr-2" />
              )}
              {getEndButtonText()}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
