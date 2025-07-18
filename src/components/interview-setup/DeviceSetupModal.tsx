"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {  Camera, Mic, Volume2, CheckCircle } from "lucide-react";
import { useState } from "react";

interface DeviceSetupModalProps {
  cameraId: string;
  micId: string;
  speakerId: string;
  onClose: () => void;
}

const DeviceSetupModal = ({ onClose }: DeviceSetupModalProps) => {
  const [tested, setTested] = useState({
    camera: false,
    mic: false,
    speaker: false,
  });

  const testCamera = () => setTested((prev) => ({ ...prev, camera: true }));
  const testMic = () => setTested((prev) => ({ ...prev, mic: true }));
  const testSpeaker = () => setTested((prev) => ({ ...prev, speaker: true }));

  const allTested = tested.camera && tested.mic && tested.speaker;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Device Setup</DialogTitle>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Device Setup</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5" />
              <span>Camera</span>
            </div>
            <div className="flex items-center gap-2">
              {tested.camera && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <Button size="sm" onClick={testCamera} className="cursor-pointer">
                Test
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5" />
              <span>Microphone</span>
            </div>
            <div className="flex items-center gap-2">
              {tested.mic && <CheckCircle className="w-4 h-4 text-green-500" />}
              <Button size="sm" onClick={testMic} className="cursor-pointer">
                Test
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5" />
              <span>Speaker</span>
            </div>
            <div className="flex items-center gap-2">
              {tested.speaker && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <Button
                size="sm"
                onClick={testSpeaker}
                className="cursor-pointer"
              >
                Test
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            disabled={!allTested}
            className="flex-1 cursor-pointer"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceSetupModal;
