"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TranscriptMessage } from "./TranscriptMessage";
import { EmptyTranscript } from "./EmptyTranscript";
import { TypingIndicator } from "./TypingIndicator";
import type { TranscriptMessage as TranscriptMessageType } from "@/types/transcript";
import { useEffect, useRef } from "react";
import { MessageSquare, Brain, User } from "lucide-react";

interface TranscriptSectionProps {
  messages: TranscriptMessageType[];
  currentTranscript: string;
  isTyping: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  currentSpeaker?: "user" | "assistant" | null;
  isCompact?: boolean;
}

export const TranscriptSection: React.FC<TranscriptSectionProps> = ({
  messages,
  currentTranscript,
  isTyping,
  isSpeaking,
  isConnected,
  currentSpeaker,
  isCompact = false,
}) => {
  const transcriptTopRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new messages arrive (since latest is at top)
  useEffect(() => {
    if (messages.length > 0) {
      transcriptTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Card
      className={`bg-gray-900/50 border-gray-800 backdrop-blur-sm py-0 rounded-2xl ${
        isCompact ? "h-full" : ""
      }`}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Professional Header */}
        <div
          className={`${
            isCompact ? "p-3" : "p-6"
          } border-b rounded-t-2xl border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-800/30`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <MessageSquare
                    className={`${
                      isCompact ? "w-4 h-4" : "w-5 h-5"
                    } text-blue-400`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold text-white ${
                      isCompact ? "text-base" : "text-lg"
                    }`}
                  >
                    Live Transcript
                  </h3>
                  <p
                    className={`text-gray-400 ${
                      isCompact ? "text-xs" : "text-sm"
                    }`}
                  >
                    Latest messages appear first
                  </p>
                </div>
              </div>

              {/* Status Indicators - Only show when there's actual activity */}
              <div className="flex items-center gap-2">
                {isTyping &&
                  (messages.length > 0 || currentTranscript.trim()) && (
                    <TypingIndicator />
                  )}

                {/* Current speaker indicator */}
                {currentSpeaker && isSpeaking && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    {currentSpeaker === "assistant" ? (
                      <Brain className="w-3 h-3 text-purple-400" />
                    ) : (
                      <User className="w-3 h-3 text-blue-400" />
                    )}
                    <span className="text-xs font-medium text-blue-400">
                      {currentSpeaker === "assistant" ? "AI" : "You"}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isSpeaking
                        ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                        : "bg-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isSpeaking ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    {isSpeaking ? "Active" : "Standby"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{messages.length}</span>
              </div>
              {isConnected && (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">
                    Live
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transcript Content */}
        <div className="relative flex-1 min-h-0 ">
          <div
            className={`${
              isCompact ? "p-3" : "p-6"
            } h-full overflow-y-auto space-y-4 bg-gradient-to-b from-transparent to-gray-900/20 rounded-b-2xl`}
          >
            <div ref={transcriptTopRef} />

            {/* Current/Typing Message - Show at top since it's the latest */}
            {currentTranscript && currentTranscript.trim() && (
              <TranscriptMessage
                message={{
                  id: "current",
                  speaker: currentSpeaker || "user",
                  text: currentTranscript,
                  timestamp: new Date(),
                  isComplete: false,
                }}
                isTyping
              />
            )}

            {/* Completed Messages - Already in reverse order (latest first) */}
            {messages.map((message, index) => (
              <TranscriptMessage
                key={message.id}
                message={message}
                isLatest={index === 0}
              />
            ))}

            {messages.length === 0 && !currentTranscript && (
              <EmptyTranscript isConnected={isConnected} />
            )}
          </div>

          {/* Gradient fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none rounded-b-2xl" />
        </div>
      </CardContent>
    </Card>
  );
};
