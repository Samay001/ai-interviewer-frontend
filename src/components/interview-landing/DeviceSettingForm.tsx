"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DeviceSettingsFormProps {
  microphoneOptions: MediaDeviceInfo[];
  speakerOptions: MediaDeviceInfo[];
  videoOptions: MediaDeviceInfo[];
  setVideoSource: (deviceId: string) => void;
  setMicrophoneSource: (deviceId: string) => void;
  setSpeakerSource: (deviceId: string) => void;
  selectedVideoSource: string;
  selectedMicrophoneSource: string;
  selectedSpeakerSource: string;
}

const DeviceSettingsForm = ({
  microphoneOptions,
  speakerOptions,
  videoOptions,
  setVideoSource,
  setMicrophoneSource,
  setSpeakerSource,
  selectedVideoSource,
  selectedMicrophoneSource,
  selectedSpeakerSource,
}: DeviceSettingsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="camera" className="text-white font-medium">
          Camera
        </Label>
        <Select value={selectedVideoSource} onValueChange={setVideoSource}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select camera" />
          </SelectTrigger>
          <SelectContent>
            {videoOptions.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="microphone" className="text-white font-medium">
          Microphone
        </Label>
        <Select
          value={selectedMicrophoneSource}
          onValueChange={setMicrophoneSource}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select microphone" />
          </SelectTrigger>
          <SelectContent>
            {microphoneOptions.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="speaker" className="text-white font-medium">
          Speaker
        </Label>
        <Select value={selectedSpeakerSource} onValueChange={setSpeakerSource}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select speaker" />
          </SelectTrigger>
          <SelectContent>
            {speakerOptions.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DeviceSettingsForm;
