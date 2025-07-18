"use client";

import type React from "react";
import { User, Brain, Clock } from "lucide-react";
import type { TranscriptMessage as TranscriptMessageType } from "@/types/transcript";

interface TranscriptMessageProps {
  message: TranscriptMessageType;
  isTyping?: boolean;
  isLatest?: boolean;
}

export const TranscriptMessage: React.FC<TranscriptMessageProps> = ({
  message,
  isTyping = false,
  isLatest = false,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const isAI = message.speaker === "assistant";

  return (
    <div
      className={`group relative ${
        isTyping
          ? "opacity-80"
          : "animate-in slide-in-from-bottom-2 duration-500"
      } ${isLatest ? "ring-1 ring-blue-500/20 rounded-lg p-2 -m-2" : ""}`}
    >
      <div className={`flex gap-4 ${isAI ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isAI
                ? "bg-gradient-to-br from-purple-500 to-blue-600 shadow-purple-500/30"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30"
            } ${isTyping ? "animate-pulse" : ""}`}
          >
            {isAI ? (
              <Brain className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div
          className={`flex-1 max-w-[75%] ${isAI ? "text-left" : "text-right"}`}
        >
          {/* Header */}
          <div
            className={`flex items-center gap-2 mb-2 ${
              isAI ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                isAI ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isAI ? "text-purple-400" : "text-blue-400"
                }`}
              >
                {isAI ? "AI Interviewer" : "You"}
              </span>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {isTyping ? "typing..." : formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* Message Bubble */}
          <div
            className={`relative p-4 rounded-2xl shadow-lg transition-all duration-300 ${
              isTyping ? "border-dashed border-2" : "border border-opacity-50"
            } ${
              isAI
                ? isTyping
                  ? "bg-gray-800/40 border-gray-600 text-gray-300"
                  : "bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-gray-600/50 text-gray-100 shadow-gray-800/50"
                : isTyping
                ? "bg-blue-500/10 border-blue-500/30 text-blue-200"
                : "bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-100 shadow-blue-500/20"
            } ${isLatest ? "ring-1 ring-blue-400/30" : ""}`}
          >
            {/* Message Text */}
            <p className="leading-relaxed text-sm">{message.text}</p>

            {/* Message Status */}
            {!isTyping && (
              <div
                className={`absolute -bottom-1 ${
                  isAI ? "-right-1" : "-left-1"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 border-gray-900 ${
                    isAI ? "bg-purple-500" : "bg-blue-500"
                  }`}
                />
              </div>
            )}

            {/* Typing indicator dots */}
            {isTyping && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                        isAI ? "bg-purple-400" : "bg-blue-400"
                      }`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  Processing...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
