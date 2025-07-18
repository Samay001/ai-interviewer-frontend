"use client";

import { useState, useRef, useCallback } from "react";
import type { TranscriptMessage } from "@/types/transcript";

export interface TranscriptHook {
  messages: TranscriptMessage[];
  currentTranscript: string;
  isTyping: boolean;
  handleTranscriptUpdate: (
    text: string,
    speaker: "user" | "assistant",
    isFinal?: boolean
  ) => void;
  clearTranscript: () => void;
}

export const useTranscript = (): TranscriptHook => {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentMessageRef = useRef<{
    speaker: "user" | "assistant";
    text: string;
    startTime: number;
  } | null>(null);

  const handleTranscriptUpdate = useCallback(
    (text: string, speaker: "user" | "assistant", isFinal = false) => {
      console.log("useTranscript: Update received:", {
        text,
        speaker,
        isFinal,
      });

      // Clear existing timeout
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }

      const now = Date.now();

      if (isFinal) {
        // This is a final transcript - add it as a completed message
        if (text.trim()) {
          const newMessage: TranscriptMessage = {
            id: `${now}-${Math.random()}`,
            speaker,
            text: text.trim(),
            timestamp: new Date(),
            isComplete: true,
          };

          console.log("useTranscript: Adding final message:", newMessage);
          // Add to the beginning of the array (latest first)
          setMessages((prev) => [newMessage, ...prev]);
          setCurrentTranscript("");
          setIsTyping(false);
          currentMessageRef.current = null;
        }
      } else {
        // This is a partial transcript
        const currentMessage = currentMessageRef.current;

        // Check if this is the same speaker continuing or a new speaker
        if (!currentMessage || currentMessage.speaker !== speaker) {
          // New speaker or first message - start fresh
          currentMessageRef.current = { speaker, text, startTime: now };
          setCurrentTranscript(text);
          setIsTyping(true);
        } else {
          // Same speaker - accumulate the text if it's longer/different
          if (
            currentMessageRef.current &&
            text.length >= currentMessageRef.current.text.length
          ) {
            currentMessageRef.current.text = text;
            setCurrentTranscript(text);
            setIsTyping(true);
          }
        }

        // Set timeout to finalize if no more updates come
        transcriptTimeoutRef.current = setTimeout(() => {
          console.log(
            "useTranscript: Timeout reached, finalizing accumulated message"
          );

          if (
            currentMessageRef.current &&
            currentMessageRef.current.text.trim()
          ) {
            const newMessage: TranscriptMessage = {
              id: `${Date.now()}-${Math.random()}`,
              speaker: currentMessageRef.current.speaker,
              text: currentMessageRef.current.text.trim(),
              timestamp: new Date(),
              isComplete: true,
            };

            console.log("useTranscript: Adding timeout message:", newMessage);
            // Add to the beginning of the array (latest first)
            setMessages((prev) => [newMessage, ...prev]);
            setCurrentTranscript("");
            setIsTyping(false);
            currentMessageRef.current = null;
          }
        }, 3000); // Wait 3 seconds for more updates to ensure complete sentences
      }
    },
    []
  );

  const clearTranscript = useCallback(() => {
    setMessages([]);
    setCurrentTranscript("");
    setIsTyping(false);
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
    }
    currentMessageRef.current = null;
  }, []);

  return {
    messages,
    currentTranscript,
    isTyping,
    handleTranscriptUpdate,
    clearTranscript,
  };
};
