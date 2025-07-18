"use client";

import type React from "react";
import { Loader2 } from "lucide-react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm">
      <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-blue-400 text-xs font-medium">Processing</span>
    </div>
  );
};
