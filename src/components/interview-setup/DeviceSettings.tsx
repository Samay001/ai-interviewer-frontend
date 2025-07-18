"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";

interface DeviceSettingsProps {
  videoOptions: MediaDeviceInfo[];
  microphoneOptions: MediaDeviceInfo[];
  speakerOptions: MediaDeviceInfo[];
  selectedVideoSource: string;
  selectedMicrophoneSource: string;
  selectedSpeakerSource: string;
  onVideoChange: (deviceId: string) => void;
  onMicrophoneChange: (deviceId: string) => void;
  onSpeakerChange: (deviceId: string) => void;
}

const DeviceSettings = ({
  videoOptions,
  microphoneOptions,
  speakerOptions,
  selectedVideoSource,
  selectedMicrophoneSource,
  selectedSpeakerSource,
  onVideoChange,
  onMicrophoneChange,
  onSpeakerChange,
}: DeviceSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Device Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-24">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Camera</Label>
            <Select value={selectedVideoSource} onValueChange={onVideoChange}>
              <SelectTrigger>
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
            <Label className="text-sm font-medium">Microphone</Label>
            <Select
              value={selectedMicrophoneSource}
              onValueChange={onMicrophoneChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {microphoneOptions.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label ||
                      `Microphone ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Speaker</Label>
            <Select
              value={selectedSpeakerSource}
              onValueChange={onSpeakerChange}
            >
              <SelectTrigger>
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

        {/* Quality Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Video Quality</Label>
            <Select defaultValue="hd">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hd">HD (720p)</SelectItem>
                <SelectItem value="fhd">Full HD (1080p)</SelectItem>
                <SelectItem value="sd">SD (480p)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Audio Quality</Label>
            <Select defaultValue="standard">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceSettings;
