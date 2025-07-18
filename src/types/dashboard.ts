export interface Interview {
  id: string;
  studentName: string;
  email: string;
  date: string;
  time: string;
  domain: string;
  type: "manual" | "ai";
  status: "upcoming" | "completed" | "cancelled";
  score: number; // Mapped from score
  adminName: string; // Mapped from adminFirstName + adminLastName
  interviewTranscript: string;
  interviewResult: string;
  // Add other fields from MongoDB document if needed in frontend
  customQuestions?: string[]; // Optional, as it might not always be present or needed directly
  aiGeneratedQuestions?: string[]; // Optional
}

export interface NewInterview {
  applicantFirstName: string;
  applicantLastName: string;
  email: string;
  date: string;
  time: string;
  domain: string;
  questions?: string;
  resume: File;
}
