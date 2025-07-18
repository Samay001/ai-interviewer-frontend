"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Zap, Sparkles, Brain, Cpu, Activity } from "lucide-react";

interface AIAvatarProps {
  currentSpeaker: "user" | "assistant" | null;
  isSpeaking: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({
  currentSpeaker,
  isSpeaking,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (currentSpeaker === "assistant" && isSpeaking) {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 4);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [currentSpeaker, isSpeaking]);

  const isAISpeaking = currentSpeaker === "assistant" && isSpeaking;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/20 flex items-center justify-center overflow-hidden">
      {/* Dynamic background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
            animation: isAISpeaking ? "pulse 2s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Floating neural network nodes */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-blue-400/40 rounded-full ${
              isAISpeaking ? "animate-pulse" : "animate-ping"
            }`}
            style={{
              left: `${15 + ((i * 7) % 70)}%`,
              top: `${20 + ((i * 11) % 60)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: isAISpeaking ? "1s" : "3s",
            }}
          />
        ))}
      </div>

      {/* Central AI Core */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Main Avatar Container */}
        <div
          className={`relative transition-all duration-500 ${
            isAISpeaking ? "scale-110" : "scale-100"
          }`}
        >
          {/* Outer Ring */}
          <div
            className={`w-40 h-40 rounded-full border-2 transition-all duration-300 ${
              isAISpeaking
                ? "border-blue-400/60 shadow-lg shadow-blue-500/30"
                : "border-purple-500/40 shadow-lg shadow-purple-500/20"
            }`}
          >
            {/* Inner Ring */}
            <div
              className={`w-full h-full rounded-full border transition-all duration-300 flex items-center justify-center ${
                isAISpeaking
                  ? "border-blue-300/40 bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                  : "border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-blue-600/10"
              }`}
            >
              {/* Core Avatar */}
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl transition-all duration-300 ${
                  isAISpeaking ? "shadow-blue-500/50" : "shadow-purple-500/30"
                }`}
              >
                {/* AI Brain Icon with Animation */}
                <div className="relative">
                  <Brain
                    className={`w-12 h-12 text-white transition-all duration-300 ${
                      isAISpeaking ? "animate-pulse" : ""
                    }`}
                  />

                  {/* Neural activity indicators */}
                  {isAISpeaking && (
                    <>
                      <div className="absolute -top-1 -right-1">
                        <Activity className="w-4 h-4 text-blue-300 animate-bounce" />
                      </div>
                      <div className="absolute -bottom-1 -left-1">
                        <Cpu
                          className="w-4 h-4 text-purple-300 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pulsing rings when speaking */}
          {isAISpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute inset-0 rounded-full border border-blue-300/20 animate-ping"
                style={{ animationDelay: "1s" }}
              />
            </>
          )}
        </div>

        {/* AI Status Display */}
        <div className="mt-8">
          <div
            className={`px-6 py-3 rounded-full backdrop-blur-sm border transition-all duration-300 ${
              isAISpeaking
                ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                : "bg-gray-800/50 border-gray-600/50 text-gray-400"
            }`}
          >
            <div className="flex items-center gap-3 text-sm font-medium">
              {isAISpeaking ? (
                <>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span>AI Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ready for Interview</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Neural Network Visualization */}
        {isAISpeaking && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-8 bg-gradient-to-b from-blue-400/60 to-transparent animate-pulse"
                style={{
                  left: `${30 + i * 8}%`,
                  top: `${40 + animationPhase * 5}%`,
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${i * 30}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Corner accent elements */}
      <div className="absolute top-4 left-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isAISpeaking ? "bg-blue-400 animate-pulse" : "bg-purple-400/50"
          }`}
        />
      </div>
      <div className="absolute top-4 right-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isAISpeaking ? "bg-purple-400 animate-pulse" : "bg-blue-400/50"
          }`}
        />
      </div>
      <div className="absolute bottom-4 left-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isAISpeaking ? "bg-green-400 animate-pulse" : "bg-gray-400/50"
          }`}
        />
      </div>
      <div className="absolute bottom-4 right-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isAISpeaking ? "bg-yellow-400 animate-pulse" : "bg-gray-400/50"
          }`}
        />
      </div>
    </div>
  );
};
