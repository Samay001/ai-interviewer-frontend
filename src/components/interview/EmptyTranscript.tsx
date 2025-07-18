"use client";

import type React from "react";
import { MessageSquare, Mic, Zap } from "lucide-react";

interface EmptyTranscriptProps {
  isConnected: boolean;
}

export const EmptyTranscript: React.FC<EmptyTranscriptProps> = ({
  isConnected,
}) => {
  return (
    <div className="text-center py-16 pt-0">
      {/* <div className="relative mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto">
          <MessageSquare className="w-5 h-5 text-blue-400" />
        </div>
      </div> */}

      <h3 className="text-xl font-semibold text-white mb-2">
        {isConnected ? "Interview in Progress" : "Ready to Start"}
      </h3>
      <p className="text-gray-400 text-base mb-4 max-w-xl mx-auto">
        {isConnected
          ? "Your conversation will appear here in real-time with intelligent processing"
          : "Start the interview to see live transcription with AI-powered analysis"}
      </p>

      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Real-time transcription</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <span>Smart processing</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <span>Instant analysis</span>
        </div>
      </div>
    </div>
  );
};
