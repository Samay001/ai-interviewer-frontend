"use client";

type CameraEventCallback = (stream: MediaStream | null) => void;
type ErrorCallback = (error: string) => void;
type StateChangeCallback = () => void;

class CameraService {
  private static instance: CameraService;
  private currentStream: MediaStream | null = null;
  private subscribers: Set<CameraEventCallback> = new Set();
  private errorSubscribers: Set<ErrorCallback> = new Set();
  private stateSubscribers: Set<StateChangeCallback> = new Set();
  private isInitialized = false;
  private isCameraOn = false;
  private isMicOn = false;
  private cleanupHandlersRegistered = false;

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  constructor() {
    // Only register essential cleanup on page unload
    if (typeof window !== "undefined" && !this.cleanupHandlersRegistered) {
      window.addEventListener("beforeunload", () => {
        console.log("CameraService: Page unloading - cleaning up camera");
        this.forceStopAllTracks();
      });
      this.cleanupHandlersRegistered = true;
    }
  }

  private registerGlobalCleanupHandlers() {
    console.log("CameraService: Registering global cleanup handlers");

    // Handle page unload/refresh - keep this one
    window.addEventListener("beforeunload", () => {
      console.log("CameraService: Page unloading - cleaning up camera");
      this.forceStopAllTracks();
    });

    // REMOVE these problematic handlers:
    // - popstate (browser navigation)
    // - visibilitychange (tab switching)
    // - blur (window focus loss)

    // Only keep the essential page unload handler
  }

  subscribe(callback: CameraEventCallback): () => void {
    this.subscribers.add(callback);
    // Immediately call with current stream
    callback(this.currentStream);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  subscribeToErrors(callback: ErrorCallback): () => void {
    this.errorSubscribers.add(callback);
    return () => {
      this.errorSubscribers.delete(callback);
    };
  }

  subscribeToStateChanges(callback: StateChangeCallback): () => void {
    this.stateSubscribers.add(callback);
    return () => {
      this.stateSubscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    console.log("CameraService: Notifying subscribers with stream:", {
      hasStream: !!this.currentStream,
      streamId: this.currentStream?.id,
      videoTracks: this.currentStream?.getVideoTracks().length || 0,
      audioTracks: this.currentStream?.getAudioTracks().length || 0,
      isCameraOn: this.isCameraOn,
      isMicOn: this.isMicOn,
    });
    this.subscribers.forEach((callback) => callback(this.currentStream));
  }

  private notifyError(error: string) {
    console.error("CameraService: Notifying error:", error);
    this.errorSubscribers.forEach((callback) => callback(error));
  }

  private notifyStateChange() {
    console.log("CameraService: Notifying state change:", {
      isCameraOn: this.isCameraOn,
      isMicOn: this.isMicOn,
      isInitialized: this.isInitialized,
    });
    this.stateSubscribers.forEach((callback) => callback());
  }

  async initialize(): Promise<void> {
    console.log("CameraService: Initialize called");

    try {
      // Stop any existing stream first
      if (this.currentStream) {
        console.log("CameraService: Stopping existing stream");
        this.currentStream.getTracks().forEach((track) => track.stop());
        this.currentStream = null;
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      console.log(
        "CameraService: Requesting media with constraints:",
        constraints
      );
      this.currentStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      console.log("CameraService: Media stream obtained:", {
        streamId: this.currentStream.id,
        videoTracks: this.currentStream.getVideoTracks().length,
        audioTracks: this.currentStream.getAudioTracks().length,
        active: this.currentStream.active,
      });

      this.isInitialized = true;
      this.isCameraOn = true;
      this.isMicOn = true;

      console.log("CameraService: Initialization completed successfully");
      this.notifySubscribers();
      this.notifyStateChange();
    } catch (error: any) {
      console.error("CameraService: Initialization failed:", error);
      let errorMessage = `Camera initialization failed: ${error.message}`;

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera/microphone access denied. Please allow permissions and refresh.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera or microphone found. Please connect devices.";
      } else if (error.name === "NotReadableError") {
        errorMessage =
          "Camera/microphone is being used by another application.";
      }

      this.notifyError(errorMessage);
      throw error;
    }
  }

  async toggleCamera(): Promise<void> {
    console.log(
      "CameraService: Toggle camera called, current state:",
      this.isCameraOn
    );

    try {
      if (this.isCameraOn) {
        // Turn OFF camera - AGGRESSIVELY STOP ALL VIDEO TRACKS
        console.log(
          "CameraService: Turning camera OFF - aggressively stopping all video access"
        );

        if (this.currentStream) {
          const videoTracks = this.currentStream.getVideoTracks();
          console.log(
            "CameraService: Found video tracks to stop:",
            videoTracks.length
          );

          videoTracks.forEach((track, index) => {
            console.log(`CameraService: Stopping video track ${index}:`, {
              id: track.id,
              label: track.label,
              readyState: track.readyState,
              enabled: track.enabled,
            });

            track.enabled = false;
            track.stop();
            this.currentStream!.removeTrack(track);

            console.log(
              `CameraService: Video track ${index} stopped, readyState:`,
              track.readyState
            );
          });

          const remainingVideoTracks = this.currentStream.getVideoTracks();
          const audioTracks = this.currentStream.getAudioTracks();

          console.log("CameraService: After stopping video tracks:", {
            remainingVideoTracks: remainingVideoTracks.length,
            audioTracks: audioTracks.length,
          });

          if (audioTracks.length > 0 && remainingVideoTracks.length === 0) {
            const newStream = new MediaStream();
            audioTracks.forEach((track) => newStream.addTrack(track));
            this.currentStream = newStream;
            console.log(
              "CameraService: Created new stream with only audio tracks"
            );
          } else if (
            remainingVideoTracks.length === 0 &&
            audioTracks.length === 0
          ) {
            this.currentStream = null;
            console.log(
              "CameraService: No tracks remaining, stream set to null"
            );
          }
        }

        this.isCameraOn = false;
        console.log(
          "CameraService: Camera turned OFF, light should be off now"
        );
      } else {
        // Turn ON camera
        console.log(
          "CameraService: Turning camera ON - requesting fresh video access"
        );

        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
              facingMode: "user",
            },
          });

          console.log("CameraService: Got new video stream:", {
            streamId: videoStream.id,
            videoTracks: videoStream.getVideoTracks().length,
          });

          if (this.currentStream) {
            videoStream.getVideoTracks().forEach((track) => {
              console.log(
                "CameraService: Adding new video track:",
                track.id,
                track.label
              );
              this.currentStream!.addTrack(track);
            });
          } else {
            this.currentStream = videoStream;
            console.log("CameraService: Created new stream with video");
          }

          this.isCameraOn = true;
          console.log("CameraService: Camera turned ON successfully");
        } catch (error: any) {
          console.error("CameraService: Failed to turn camera on:", error);
          this.notifyError(`Failed to turn camera on: ${error.message}`);
          return;
        }
      }

      console.log("CameraService: Notifying all subscribers of camera toggle");
      this.notifySubscribers();
      this.notifyStateChange();
    } catch (error: any) {
      console.error("CameraService: Toggle camera failed:", error);
      this.notifyError(`Camera toggle failed: ${error.message}`);
    }
  }

  async toggleMicrophone(): Promise<void> {
    console.log(
      "CameraService: Toggle microphone called, current state:",
      this.isMicOn
    );

    try {
      if (this.isMicOn) {
        // Turn OFF microphone - AGGRESSIVELY STOP ALL AUDIO TRACKS
        console.log(
          "CameraService: Turning microphone OFF - aggressively stopping all audio access"
        );

        if (this.currentStream) {
          const audioTracks = this.currentStream.getAudioTracks();
          console.log(
            "CameraService: Found audio tracks to stop:",
            audioTracks.length
          );

          audioTracks.forEach((track, index) => {
            console.log(`CameraService: Stopping audio track ${index}:`, {
              id: track.id,
              label: track.label,
              readyState: track.readyState,
              enabled: track.enabled,
            });

            track.enabled = false;
            track.stop();
            this.currentStream!.removeTrack(track);

            console.log(
              `CameraService: Audio track ${index} stopped, readyState:`,
              track.readyState
            );
          });

          const remainingAudioTracks = this.currentStream.getAudioTracks();
          const videoTracks = this.currentStream.getVideoTracks();

          console.log("CameraService: After stopping audio tracks:", {
            remainingAudioTracks: remainingAudioTracks.length,
            videoTracks: videoTracks.length,
          });

          if (videoTracks.length > 0 && remainingAudioTracks.length === 0) {
            const newStream = new MediaStream();
            videoTracks.forEach((track) => newStream.addTrack(track));
            this.currentStream = newStream;
            console.log(
              "CameraService: Created new stream with only video tracks"
            );
          } else if (
            remainingAudioTracks.length === 0 &&
            videoTracks.length === 0
          ) {
            this.currentStream = null;
            console.log(
              "CameraService: No tracks remaining, stream set to null"
            );
          }
        }

        this.isMicOn = false;
        console.log("CameraService: Microphone turned OFF");
      } else {
        // Turn ON microphone
        console.log(
          "CameraService: Turning microphone ON - requesting fresh audio access"
        );

        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          console.log("CameraService: Got new audio stream:", {
            streamId: audioStream.id,
            audioTracks: audioStream.getAudioTracks().length,
          });

          if (this.currentStream) {
            audioStream.getAudioTracks().forEach((track) => {
              console.log(
                "CameraService: Adding new audio track:",
                track.id,
                track.label
              );
              this.currentStream!.addTrack(track);
            });
          } else {
            this.currentStream = audioStream;
            console.log("CameraService: Created new stream with audio");
          }

          this.isMicOn = true;
          console.log("CameraService: Microphone turned ON successfully");
        } catch (error: any) {
          console.error("CameraService: Failed to turn microphone on:", error);
          this.notifyError(`Failed to turn microphone on: ${error.message}`);
          return;
        }
      }

      console.log(
        "CameraService: Notifying all subscribers of microphone toggle"
      );
      this.notifySubscribers();
      this.notifyStateChange();
    } catch (error: any) {
      console.error("CameraService: Toggle microphone failed:", error);
      this.notifyError(`Microphone toggle failed: ${error.message}`);
    }
  }

  async switchCamera(deviceId: string): Promise<void> {
    if (!this.currentStream) return;

    try {
      console.log("CameraService: Switching camera to:", deviceId);

      const videoTracks = this.currentStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.stop();
        this.currentStream!.removeTrack(track);
      });

      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });

      newVideoStream.getVideoTracks().forEach((track) => {
        this.currentStream!.addTrack(track);
      });

      this.notifySubscribers();
      this.notifyStateChange();
    } catch (error: any) {
      console.error("CameraService: Switch camera failed:", error);
      this.notifyError(`Camera switch failed: ${error.message}`);
    }
  }

  getStream(): MediaStream | null {
    return this.currentStream;
  }

  isCameraEnabled(): boolean {
    const hasVideoTracks = (this.currentStream?.getVideoTracks()?.length ?? 0) > 0;
    const enabled = this.isCameraOn && hasVideoTracks;

    console.log("CameraService: isCameraEnabled check:", {
      isCameraOn: this.isCameraOn,
      hasVideoTracks,
      result: enabled,
    });
    return enabled;
  }

  isMicrophoneEnabled(): boolean {
    const hasAudioTracks = (this.currentStream?.getAudioTracks()?.length ?? 0) > 0;
    const enabled = this.isMicOn && hasAudioTracks;

    console.log("CameraService: isMicrophoneEnabled check:", {
      isMicOn: this.isMicOn,
      hasAudioTracks,
      result: enabled,
    });
    return enabled;
  }

  isReady(): boolean {
    const ready = this.isInitialized;
    console.log("CameraService: isReady check:", {
      isInitialized: this.isInitialized,
      result: ready,
    });
    return ready;
  }

  cleanup(): void {
    console.log("CameraService: Cleaning up and turning off all devices...");
    this.forceStopAllTracks();
  }

  forceStopAllTracks(): void {
    console.log("CameraService: FORCE STOPPING ALL TRACKS - nuclear option");

    if (this.currentStream) {
      const allTracks = this.currentStream.getTracks();
      console.log("CameraService: Force stopping tracks:", allTracks.length);

      allTracks.forEach((track, index) => {
        console.log(`CameraService: Force stopping track ${index}:`, {
          kind: track.kind,
          id: track.id,
          label: track.label,
          readyState: track.readyState,
        });

        track.enabled = false;
        track.stop();
        this.currentStream!.removeTrack(track);

        console.log(
          `CameraService: Track ${index} force stopped, readyState:`,
          track.readyState
        );
      });

      this.currentStream = null;
    }

    // Reset all states
    this.isCameraOn = false;
    this.isMicOn = false;
    this.isInitialized = false;

    console.log(
      "CameraService: All tracks force stopped, camera light should be OFF"
    );

    // Notify subscribers
    this.notifySubscribers();
    this.notifyStateChange();
  }

  // Method to manually trigger cleanup (for testing)
  emergencyStop(): void {
    console.log("CameraService: EMERGENCY STOP TRIGGERED");
    this.forceStopAllTracks();
  }
}

export default CameraService;
