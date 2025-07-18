"use client";

import type React from "react";
import { useSharedCamera } from "./useSharedCamera";

export interface CameraHook {
  stream: MediaStream | null;
  isCameraOn: boolean;
  isInitialized: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  toggleCamera: () => Promise<void>;
  retryCamera: () => Promise<void>;
}

export const useCamera = (): CameraHook => {
  const sharedCamera = useSharedCamera();

  const retryCamera = async () => {
    await sharedCamera.initialize();
  };

  return {
    stream: sharedCamera.stream,
    isCameraOn: sharedCamera.isCameraOn,
    isInitialized: sharedCamera.isInitialized,
    error: sharedCamera.error,
    videoRef: sharedCamera.videoRef,
    toggleCamera: sharedCamera.toggleCamera,
    retryCamera,
  };
};
