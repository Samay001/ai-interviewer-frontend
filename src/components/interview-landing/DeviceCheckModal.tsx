"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Volume2, Mic, Camera } from "lucide-react";

interface DeviceSetupModalProps {
  cameraId: string;
  micId: string;
  speakerId: string;
  onClose: () => void;
}

const DeviceSetupModal = ({
  cameraId,
  micId,
  // speakerId,
  onClose,
}: DeviceSetupModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  useEffect(() => {
    const initTestStream = async () => {
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({
          video: cameraId ? { deviceId: cameraId } : true,
          audio: micId ? { deviceId: micId } : true,
        });

        setStream(testStream);
        if (videoRef.current) {
          videoRef.current.srcObject = testStream;
        }
      } catch (err) {
        console.error("Error initializing test stream:", err);
      }
    };

    initTestStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId, micId]);

  const testAudio = () => {
    setIsTestingAudio(true);
    // Play a test sound
    const audio = new Audio("/placeholder.svg?height=1&width=1");
    audio.play().catch(console.error);

    setTimeout(() => {
      setIsTestingAudio(false);
    }, 2000);
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Camera className="w-6 h-6" />
            Device Test Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Test
            </h3>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-64 rounded-lg bg-black"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Microphone Test
            </h3>
            <p className="text-purple-200 text-sm">
              Speak into your microphone. You should see the audio levels
              change.
            </p>
            <div className="w-full bg-purple-900/50 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Speaker Test
            </h3>
            <Button
              onClick={testAudio}
              disabled={isTestingAudio}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isTestingAudio ? "Playing Test Sound..." : "Test Speakers"}
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Close
            </Button>
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Setup Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceSetupModal;
