"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Interview } from "@/types";
import { Calendar, User, MapPin, CheckCircle } from "lucide-react";

interface InterviewResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
}

const InterviewResultModal: React.FC<InterviewResultModalProps> = ({
  isOpen,
  onClose,
  interview,
}) => {
  if (!interview) {
    return null;
  }

  // Calculate score percentage based on a max score of 5
  // Ensure score is not negative or greater than 5 to prevent percentages outside 0-100%
  const safeScore = Math.max(
    0,
    Math.min(5, interview.score !== undefined ? interview.score : 0)
  );
  const scorePercentage = Math.round((safeScore / 5) * 100);

  // --- DEBUG LOG ---
  console.log(
    `Interview ID: ${interview.id}, Raw Score: ${interview.score}, Safe Score: ${safeScore}, Calculated Percentage: ${scorePercentage}%`
  );
  // --- END DEBUG LOG ---

  const scoreColor =
    scorePercentage >= 80
      ? "bg-green-500"
      : scorePercentage >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 capitalize">
            Interview Results: {interview.studentName}
            <Badge variant="secondary" className="text-xs">
              {interview.type === "ai" ? "AI Interview" : "Manual Interview"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed results for the interview conducted on {interview.date}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          {" "}
          {/* Added pr-4 and -mr-4 for scrollbar */}
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>
                Applicant:{" "}
                <span className="capitalize">{interview.studentName}</span> (
                {interview.email})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="capitalize">Domain: {interview.domain}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Date: {interview.date} at {interview.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span className="capitalize">Status: {interview.status}</span>
            </div>
            {interview.adminName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="capitalize">
                  Conducted by: {interview.adminName}
                </span>
              </div>
            )}

            {/* Score Section */}
            {typeof interview.score === "number" && (
              <div className="mt-4">
                <h4 className="font-semibold text-lg mb-2">Overall Score</h4>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-primary">
                    {scorePercentage}%
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={scorePercentage}
                      className={`h-3 ${scoreColor}`}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {scorePercentage >= 80
                        ? "Excellent performance!"
                        : scorePercentage >= 50
                        ? "Good performance, some areas for improvement."
                        : "Needs significant improvement."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Interview Result */}
            {interview.interviewResult && (
              <div className="mt-4">
                <h4 className="font-semibold text-lg mb-2">
                  Interview Result Summary
                </h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {interview.interviewResult}
                </p>
              </div>
            )}

            {/* Interview Transcript */}
            {interview.interviewTranscript && (
              <div className="mt-4">
                <h4 className="font-semibold text-lg mb-2">
                  Interview Transcript
                </h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {interview.interviewTranscript}
                </p>
              </div>
            )}

            {/* AI Generated Questions */}
            {interview.aiGeneratedQuestions &&
              interview.aiGeneratedQuestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">
                    AI Generated Questions
                  </h4>
                  <ScrollArea className="h-32 rounded-md border p-4">
                    <ul className="list-disc list-inside text-muted-foreground">
                      {interview.aiGeneratedQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

            {/* Custom Questions */}
            {interview.customQuestions &&
              interview.customQuestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">
                    Custom Questions
                  </h4>
                  <ScrollArea className="h-32 rounded-md border p-4">
                    <ul className="list-disc list-inside text-muted-foreground">
                      {interview.customQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewResultModal;
