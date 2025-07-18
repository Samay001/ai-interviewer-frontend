"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { createInterviewer } from "@/constants";
import { useCamera } from "@/hooks/useCamera";
import { useAudio } from "@/hooks/useAudio";
import { useTranscript } from "@/hooks/useTranscript";
import CameraService from "@/services/CameraService";

import { Header } from "./Header";
import { VideoSection } from "./VideoSection";
import TranscriptSection from "./TranscriptSection-interview";
import { ControlsSection } from "./ControlsSection";

const InterviewWidget = () => {
  const router = useRouter();

  const currentApplicant = useSelector((state) => state.applicant.currentApplicant);
  const [interviewerConfig, setInterviewerConfig] = useState(null);

  const [callStatus, setCallStatus] = useState("INACTIVE");
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  const camera = useCamera();
  const audio = useAudio(camera.stream);
  const transcript = useTranscript();

  useEffect(() => {
    if (currentApplicant) {
      const config = createInterviewer(currentApplicant);
      setInterviewerConfig(config);
    }
  }, [currentApplicant]);


  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setIsInitializing(true);
        if (!camera.isInitialized) await camera.retryCamera();
      } catch {
        setError("Failed to initialize camera.");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCamera();
  }, []);

  useEffect(() => {
    const onCallStart = () => setCallStatus("ACTIVE");
    const onCallEnd = () => setCallStatus("FINISHED");

    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMsg = { role: message.role, content: message.transcript ?? "" };
        setMessages((prev) => [...prev, newMsg]);
        setCurrentSpeaker(message.role === "user" ? "user" : "assistant");
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error) => console.error("Vapi Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    if (callStatus === "FINISHED") {
      router.push("/interview-score");
    }
  }, [messages, callStatus]);

  const startCall = async () => {
    if (!camera.isInitialized || camera.error) {
      setError("Camera not ready.");
      return;
    }

    if (!interviewerConfig) {
      setError("Interview config not ready.");
      return;
    }

    setCallStatus("CONNECTING");
    setError(null);

    try {
      await vapi.start(interviewerConfig); 
    } catch (err) {
      console.error("Failed to start Vapi call:", err);
      setError("Failed to start interview.");
      setCallStatus("INACTIVE");
    }
  };


  const endCall = () => {
    setCallStatus("FINISHED");
    setIsEnding(true);
    vapi.stop();
    transcript.clearTranscript();
    CameraService.getInstance().cleanup();
    router.push("/dashboard");
  };

  const canStartInterview =
    camera.isInitialized &&
    camera.isCameraOn &&
    audio.isMicOn &&
    !camera.error &&
    !isInitializing;

  const cameraReady = camera.isInitialized && camera.isCameraOn && !camera.error;
  const micReady = audio.isMicOn && audio.isInitialized;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        isConnected={callStatus === "ACTIVE"}
        isConnecting={callStatus === "CONNECTING"}
        isInitializing={isInitializing}
        error={error}
        canStartInterview={canStartInterview}
        cameraReady={cameraReady}
        micReady={micReady}
        onStartCall={startCall}
        onEndCall={endCall}
        isEnding={isEnding}
      />

      <div className="p-4 space-y-4 max-h-[calc(100vh-100px)] overflow-hidden">
        <div className="h-[65vh]">
          <VideoSection
            camera={camera}
            audio={audio}
            currentSpeaker={currentSpeaker}
            isSpeaking={isSpeaking}
            isConnected={callStatus === "ACTIVE"}
            isCompact
          />
        </div>

        <div className="h-[20vh]">
          <TranscriptSection
            messages={[
              ...transcript.messages,
              ...messages.map((msg, index) => ({
                id: `saved-${index}`,
                speaker: msg.role,
                text: msg.content,
                // timestamp: new Date().toISOString(),
                isComplete: true,
              })),
            ]}
            currentTranscript={transcript.currentTranscript}
            isTyping={transcript.isTyping}
            isSpeaking={isSpeaking}
            isConnected={callStatus === "ACTIVE"}
            currentSpeaker={currentSpeaker}
            isCompact
          />
        </div>

        {/* <div className="h-[10vh] flex items-center justify-center">
          <ControlsSection
            isConnected={callStatus === "ACTIVE"}
            canStartInterview={canStartInterview}
            camera={camera}
            audio={audio}
            isCompact
          />
        </div> */}
      </div>
    </div>
  );
};

export default InterviewWidget;