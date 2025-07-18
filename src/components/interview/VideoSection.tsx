import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserVideo } from "./UserVideo";
import { AIAvatar } from "./AIAvatar";
import type { CameraHook } from "@/hooks/useCamera";
import type { AudioHook } from "@/hooks/useAudio";
import { Brain, Volume2 } from "lucide-react";

interface VideoSectionProps {
  camera: CameraHook;
  audio: AudioHook;
  currentSpeaker: "user" | "assistant" | null;
  isSpeaking: boolean;
  isConnected: boolean;
  isCompact?: boolean;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  camera,
  audio,
  currentSpeaker,
  isSpeaking,
  isConnected,
  isCompact = false,
}) => {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-4 h-full ${
        isCompact ? "max-h-full" : ""
      }`}
    >
      <UserVideo
        camera={camera}
        audio={audio}
        currentSpeaker={currentSpeaker}
        isConnected={isConnected}
        isCompact={isCompact}
        canToggleCamera={!isConnected} // Disable camera toggle during interview
      />

      <Card
        className={`bg-gray-900/50 border-gray-800 overflow-hidden transition-all duration-300 ${
          currentSpeaker === "assistant" && isSpeaking
            ? "ring-2 ring-purple-500/50 border-purple-500/30 shadow-lg shadow-purple-500/10"
            : ""
        } ${isCompact ? "h-full" : ""}`}
      >
        <CardContent className="p-0 relative h-full flex flex-col">
          <div
            className={`relative overflow-hidden flex-1 ${
              isCompact ? "min-h-0" : "aspect-video"
            }`}
          >
            <AIAvatar currentSpeaker={currentSpeaker} isSpeaking={isSpeaking} />
          </div>
          <div className="p-3 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    AI Interviewer
                  </h3>
                  <p className="text-xs text-gray-400">
                    Powered by Advanced AI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isConnected
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : "bg-gray-800"
                  }`}
                >
                  <Volume2
                    className={`w-3 h-3 ${
                      isConnected ? "text-emerald-400" : "text-gray-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
