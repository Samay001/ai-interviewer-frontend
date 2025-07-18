"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { VideoSection } from "./VideoSection";
import { TranscriptSection } from "./TranscriptSection";
import { ControlsSection } from "./ControlsSection";
import { Header } from "./Header";
import { useCamera } from "@/hooks/useCamera";
import { useAudio } from "@/hooks/useAudio";
import { useTranscript } from "@/hooks/useTranscript";
import CameraService from "@/services/CameraService";

interface VapiWidgetProps {
  config?: Record<string, unknown>;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ config = {} }) => {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY!;
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!;

  // Vapi states
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<
    "user" | "assistant" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  // Custom hooks
  const camera = useCamera();
  const audio = useAudio(camera.stream);
  const transcript = useTranscript();

  // Memoize the transcript handler to prevent recreating on every render
  const handleTranscriptUpdate = useMemo(
    () => transcript.handleTranscriptUpdate,
    [transcript.handleTranscriptUpdate]
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Initialize camera when component mounts
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setIsInitializing(true);
        console.log("VapiWidget: Initializing camera...");

        // Initialize camera if not already done
        if (!camera.isInitialized) {
          await camera.retryCamera();
        }

        console.log("VapiWidget: Camera initialization completed");
      } catch (err) {
        console.error("VapiWidget: Camera initialization failed:", err);
        setError("Failed to initialize camera. Please check permissions.");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCamera();
  }, []);

  // Initialize Vapi
  useEffect(() => {
    if (!apiKey || !assistantId) {
      console.error("Missing API key or Assistant ID");
      setError(
        "Missing API configuration. Please check environment variables."
      );
      setIsInitializing(false);
      return;
    }

    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    const handleCallStart = () => {
      console.log("VapiWidget: Call started");
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleCallEnd = async () => {
      console.log("VapiWidget: Call ended");
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      setCurrentSpeaker(null);

      // Clear transcript
      transcript.clearTranscript();

      // Cleanup camera and microphone
      console.log("VapiWidget: Cleaning up devices...");
      const cameraService = CameraService.getInstance();
      cameraService.cleanup();

      // If ending was initiated by user, redirect to dashboard
      if (isEnding) {
        console.log("VapiWidget: Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000); // Small delay to show the end state
      }

      setIsEnding(false);
    };

    const handleSpeechStart = () => {
      console.log("VapiWidget: Speech started");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("VapiWidget: Speech ended");
      setIsSpeaking(false);
    };

    const handleMessage = (message: any) => {
      console.log("VapiWidget: Message received:", message);

      if (message.type === "transcript") {
        const speaker = message.role === "user" ? "user" : "assistant";
        setCurrentSpeaker(speaker);

        // Handle partial and final transcripts
        if (message.transcriptType === "partial") {
          // For partial transcripts, update the current transcript
          handleTranscriptUpdate(message.transcript, speaker, false);
        } else {
          // For final transcripts, finalize the message
          handleTranscriptUpdate(message.transcript, speaker, true);
        }
      }
    };

    const handleError = (error: any) => {
      console.error("Vapi error:", error);
      setError("Interview connection error. Please try again.");
      setIsConnecting(false);
    };

    vapiInstance.on("call-start", handleCallStart);
    vapiInstance.on("call-end", handleCallEnd);
    vapiInstance.on("speech-start", handleSpeechStart);
    vapiInstance.on("speech-end", handleSpeechEnd);
    vapiInstance.on("message", handleMessage);
    vapiInstance.on("error", handleError);

    return () => {
      vapiInstance.off("call-start", handleCallStart);
      vapiInstance.off("call-end", handleCallEnd);
      vapiInstance.off("speech-start", handleSpeechStart);
      vapiInstance.off("speech-end", handleSpeechEnd);
      vapiInstance.off("message", handleMessage);
      vapiInstance.off("error", handleError);
      vapiInstance.stop();
    };
  }, [
    apiKey,
    assistantId,
    handleTranscriptUpdate,
    transcript.clearTranscript,
    router,
    isEnding,
  ]);

  const startCall = async () => {
    if (vapi && camera.isInitialized && !camera.error) {
      try {
        setIsConnecting(true);
        setError(null);
        console.log("VapiWidget: Starting call...");
        await vapi.start(assistantId);
      } catch (err) {
        console.error("VapiWidget: Failed to start call:", err);
        setError("Failed to start interview. Please try again.");
        setIsConnecting(false);
      }
    } else {
      setError("Camera not ready. Please check your camera settings.");
    }
  };

  const endCall = () => {
    if (vapi) {
      console.log("VapiWidget: Ending call...");
      setIsEnding(true); // Set flag to indicate user-initiated end
      vapi.stop();
      router.push("/candidate-dashboard"); // 
    }
  };

  const canStartInterview =
    camera.isInitialized &&
    camera.isCameraOn &&
    audio.isMicOn &&
    !camera.error &&
    !isInitializing;
  const cameraReady =
    camera.isInitialized && camera.isCameraOn && !camera.error;
  const micReady = audio.isMicOn && audio.isInitialized;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        isConnected={isConnected}
        isConnecting={isConnecting}
        isInitializing={isInitializing}
        error={error}
        canStartInterview={canStartInterview}
        cameraReady={cameraReady}
        micReady={micReady}
        onStartCall={startCall}
        onEndCall={endCall}
        isEnding={isEnding}
      />

      {/* Compact Layout - Everything in one view */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-100px)] overflow-hidden">
        {/* Top Row - Video Section (Reduced Height) */}
        <div className="h-[55vh]">
          <VideoSection
            camera={camera}
            audio={audio}
            currentSpeaker={currentSpeaker}
            isSpeaking={isSpeaking}
            isConnected={isConnected}
            isCompact={true}
          />
        </div>

        {/* Bottom Row - Transcript Section (Reduced Height) */}
        <div className="h-[20vh]">
          <TranscriptSection
            messages={transcript.messages}
            currentTranscript={transcript.currentTranscript}
            isTyping={transcript.isTyping}
            isSpeaking={isSpeaking}
            isConnected={isConnected}
            currentSpeaker={currentSpeaker}
            isCompact={true}
          />
        </div>

        {/* Controls Section (Minimal) */}
        <div className="h-[10vh] flex items-center justify-center">
          <ControlsSection
            isConnected={isConnected}
            canStartInterview={canStartInterview}
            camera={camera}
            audio={audio}
            isCompact={true}
          />
        </div>
      </div>
    </div>
  );
};

export default VapiWidget;
