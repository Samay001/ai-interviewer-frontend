"use client";

import { useEffect } from "react";
import CameraService from "@/services/CameraService";

export const CameraCleanup = () => {
  useEffect(() => {
    const cameraService = CameraService.getInstance();

    // Only handle page unload, not tab switching or visibility changes
    const handleBeforeUnload = () => {
      console.log(
        "CameraCleanup: Component-level page unloading - force stopping camera"
      );
      cameraService.forceStopAllTracks();
    };

    // REMOVE visibilitychange handler - this was causing camera to turn off on tab switch

    // Register only essential event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup event listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Force stop camera on component unmount
      console.log(
        "CameraCleanup: Component unmounting - force stopping camera"
      );
      cameraService.forceStopAllTracks();
    };
  }, []);

  return null; // This component doesn't render anything
};
