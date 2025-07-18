export interface TranscriptMessage {
  id: string;
  speaker: "user" | "assistant";
  text: string;
  timestamp: Date;
  isComplete: boolean;
}
