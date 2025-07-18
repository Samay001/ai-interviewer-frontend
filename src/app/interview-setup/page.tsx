"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSharedCamera } from "@/hooks/useSharedCamera";
import { CameraCleanup } from "@/components/CameraCleanup";
import CameraPreview from "@/components/interview-setup/CameraPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Settings, Play, ArrowRight, Loader2 } from "lucide-react";
import DeviceSettings from "@/components/interview-setup/DeviceSettings";
import InterviewDetails from "@/components/interview-setup/InterviewDetails";
import SystemCheck from "@/components/interview-setup/SystemCheck";
import DeviceSetupModal from "@/components/interview-landing/DeviceCheckModal";

// Enhanced Action Buttons Component
const ActionButtons = ({
  onTestSetup,
  onStartInterview,
  canStart,
  cameraReady = false,
  micReady = false,
  isLoading = false,
}: {
  onTestSetup: () => void;
  onStartInterview: () => void;
  canStart: boolean;
  cameraReady?: boolean;
  micReady?: boolean;
  isLoading?: boolean;
}) => {
  const getStatusMessage = () => {
    if (!cameraReady && !micReady)
      return "Please enable camera and microphone to continue";
    if (!cameraReady) return "Please enable camera to continue";
    if (!micReady) return "Please enable microphone to continue";
    return "All systems ready!";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Ready to Begin?</h3>
            <p className="text-sm text-muted-foreground">
              Make sure your camera and microphone are working properly before
              starting the interview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onTestSetup}
              variant="outline"
              className="flex-1 h-12 bg-transparent cursor-pointer"
              disabled={isLoading}
            >
              <Settings className="w-4 h-4 mr-2" />
              Test Setup
            </Button>
            <Button
              onClick={onStartInterview}
              disabled={!canStart || isLoading}
              className="cursor-pointer flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Interview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          <div className="text-center">
            {canStart ? (
              <Badge
                variant="default"
                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                All systems ready!
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                {getStatusMessage()}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Define the type interface
interface timelineStepType {
  id: number;
  title: string;
  status: boolean;
}

const InterviewSetupPage = () => {
  const router = useRouter();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoSource, setVideoSource] = useState("");
  const [selectedMicrophoneSource, setMicrophoneSource] = useState("");
  const [selectedSpeakerSource, setSpeakerSource] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  // Use shared camera service
  const sharedCamera = useSharedCamera();

  const microphoneOptions = devices.filter((a) => a.kind === "audioinput");
  const videoOptions = devices.filter((a) => a.kind === "videoinput");
  const speakerOptions = devices.filter((a) => a.kind === "audiooutput");

  // Initialize devices and shared camera
  useEffect(() => {
    const initDevices = async () => {
      try {
        // Initialize shared camera service
        await sharedCamera.initialize();

        // Get device list
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);

        // Set default devices
        const defaultVideo = deviceList.find(
          (device) => device.kind === "videoinput"
        );
        const defaultAudio = deviceList.find(
          (device) => device.kind === "audioinput"
        );

        if (defaultVideo) setVideoSource(defaultVideo.deviceId);
        if (defaultAudio) setMicrophoneSource(defaultAudio.deviceId);
      } catch (err) {
        console.error("Device initialization failed:", err);
      }
    };

    initDevices();
  }, []);

  // Simple speech detection for the shared camera stream
  useEffect(() => {
    if (!sharedCamera.stream || !sharedCamera.isMicOn) {
      setIsSpeaking(false);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animationFrame: number | null = null;

    const initSpeechDetection = () => {
      try {
        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaStreamSource(
          sharedCamera.stream!
        );
        source.connect(analyser);

        const detectSpeech = () => {
          if (!analyser) return;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);

          const average =
            dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          const speechThreshold = 20;
          setIsSpeaking(average > speechThreshold);

          animationFrame = requestAnimationFrame(detectSpeech);
        };

        detectSpeech();
      } catch (err) {
        console.error("Speech detection error:", err);
      }
    };

    initSpeechDetection();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [sharedCamera.stream, sharedCamera.isMicOn]);

  const switchCamera = async (deviceId: string) => {
    try {
      await sharedCamera.switchCamera(deviceId);
      setVideoSource(deviceId);
    } catch (err) {
      console.error("Error switching camera:", err);
    }
  };

  const switchMicrophone = async (deviceId: string) => {
    try {
      setMicrophoneSource(deviceId);
    } catch (err) {
      console.error("Error switching microphone:", err);
    }
  };

  const handleStartInterview = async () => {
    setIsStartingInterview(true);

    try {
      // Add any pre-interview setup logic here
      // For example: save settings, validate setup, etc.
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate setup time

      // Navigate to the main interview page
      router.push("/interview");
    } catch (error) {
      console.error("Error starting interview:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsStartingInterview(false);
    }
  };

  const systemCheckData: timelineStepType[] = [
    {
      id: 0,
      title: "Camera is working",
      status: sharedCamera.isCameraOn && sharedCamera.isInitialized,
    },
    {
      id: 1,
      title: "Microphone is working",
      status: sharedCamera.isMicOn && sharedCamera.isInitialized,
    },
    {
      id: 2,
      title: "Speaker is working",
      status: true,
    },
    {
      id: 3,
      title: "Stable Internet",
      status: true,
    },
  ];

  const canStartInterview =
    sharedCamera.isCameraOn &&
    sharedCamera.isMicOn &&
    sharedCamera.isInitialized;

  return (
    <>
      {/* Global camera cleanup component */}
      <CameraCleanup />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="relative border-b border-border/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="absolute top-4 right-4 z-20">
            <ThemeToggle />
          </div>
          <div className="text-center py-16 px-6">
            <div className="max-w-8xl mx-auto">
              <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Start Your{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Interview
                </span>
                ?
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Let's make sure everything is set up perfectly for your
                interview experience. Check your camera and microphone settings
                below to ensure the best possible session.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Camera Preview */}
            <div className="space-y-6">
              <CameraPreview
                videoRef={sharedCamera.videoRef}
                isCameraOn={sharedCamera.isCameraOn}
                isMicOn={sharedCamera.isMicOn}
                isSpeaking={isSpeaking}
                toggleCamera={sharedCamera.toggleCamera}
                toggleMicrophone={sharedCamera.toggleMicrophone}
                onSettingsClick={() => setShowModal(true)}
              />
              <ActionButtons
                onTestSetup={() => setShowModal(true)}
                onStartInterview={handleStartInterview}
                canStart={canStartInterview}
                cameraReady={sharedCamera.isCameraOn}
                micReady={sharedCamera.isMicOn}
                isLoading={isStartingInterview}
              />
            </div>

            {/* Right Side - Settings and Info */}
            <div className="space-y-6">
              {/* Top Row - Interview Details and System Check */}
              <div className="grid grid-cols-1 gap-6">
                <InterviewDetails />
                <SystemCheck data={systemCheckData} />
              </div>

              {/* Device Settings */}
              <DeviceSettings
                videoOptions={videoOptions}
                microphoneOptions={microphoneOptions}
                speakerOptions={speakerOptions}
                selectedVideoSource={selectedVideoSource}
                selectedMicrophoneSource={selectedMicrophoneSource}
                selectedSpeakerSource={selectedSpeakerSource}
                onVideoChange={switchCamera}
                onMicrophoneChange={switchMicrophone}
                onSpeakerChange={setSpeakerSource}
              />
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <DeviceSetupModal
            cameraId={selectedVideoSource}
            micId={selectedMicrophoneSource}
            speakerId={selectedSpeakerSource}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default InterviewSetupPage;
