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
import { ScrollArea } from "@/components/ui/scroll-area"; // Keep for inner lists
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Interview } from "@/types";
import {
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Trophy,
  Lightbulb,
  Target,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DetailedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
}

const DetailedReportModal: React.FC<DetailedReportModalProps> = ({
  isOpen,
  onClose,
  interview,
}) => {
  if (!interview) {
    return null;
  }

  // Calculate score percentage based on a max score of 5
  // The interview.score is now explicitly stated to be out of 5.
  const safeScore = Math.max(
    0,
    Math.min(5, interview.score !== undefined ? interview.score : 0)
  );
  const scorePercentage = Math.round((safeScore / 5) * 100);

  const scoreColor =
    scorePercentage >= 80
      ? "bg-green-500"
      : scorePercentage >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  // Updated: Mock data for skill breakdown, now directly influenced by overall score (out of 5)
  const generateMockSkillData = (overallScoreOutOf5: number) => {
    // Use the overallScoreOutOf5 directly as the base for individual skill scores
    const baseScore = overallScoreOutOf5;

    const skills = [
      {
        name: "Technical Skills",
        score: Math.min(
          5,
          Math.max(1, baseScore * (1 + (Math.random() * 0.2 - 0.1)))
        ),
      }, // +/- 10% variation
      {
        name: "Problem Solving",
        score: Math.min(
          5,
          Math.max(1, baseScore * (1 + (Math.random() * 0.2 - 0.1)))
        ),
      },
      {
        name: "Communication",
        score: Math.min(
          5,
          Math.max(1, baseScore * (1 + (Math.random() * 0.2 - 0.1)))
        ),
      },
      {
        name: "Domain Knowledge",
        score: Math.min(
          5,
          Math.max(1, baseScore * (1 + (Math.random() * 0.2 - 0.1)))
        ),
      },
      {
        name: "Behavioral Fit",
        score: Math.min(
          5,
          Math.max(1, baseScore * (1 + (Math.random() * 0.2 - 0.1)))
        ),
      },
    ];
    return skills.map((skill) => ({
      ...skill,
      fullMark: 5, // Max score for radar chart
    }));
  };

  const skillData = generateMockSkillData(interview.score);

  const getPerformanceLabel = (score: number): string => {
    // This label is based on the original 0-10 scale, so we'll adjust it for the 0-5 scale
    if (score >= 4) return "Excellent"; // Corresponds to 8/10
    if (score >= 3) return "Good"; // Corresponds to 6/10
    if (score >= 2) return "Fair"; // Corresponds to 4/10
    return "Needs Improvement"; // Corresponds to <4/10
  };

  // Updated: Key Strengths and Areas for Development thresholds adjusted for 0-5 scale
  const keyStrengths = skillData
    .filter((skill) => skill.score >= 4.0) // Skills with score 4.0 or higher are strengths
    .sort((a, b) => b.score - a.score)
    .slice(0, 2); // Top 2 strengths

  const areasForDevelopment = skillData
    .filter((skill) => skill.score < 2.5) // Skills with score less than 2.5 are areas for development
    .sort((a, b) => a.score - b.score)
    .slice(0, 2); // Bottom 2 areas

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 capitalize">
            <Trophy className="w-6 h-6 text-primary" />
            Detailed Interview Report: {interview.studentName}
            <Badge variant="secondary" className="text-xs">
              {interview.type === "ai" ? "AI Interview" : "Manual Interview"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            In-depth analysis of the interview conducted on {interview.date}
          </DialogDescription>
        </DialogHeader>
        {/* Apply overflow-y-auto to the main content wrapper */}
        <div className="flex-1 overflow-y-auto pr-4 -mr-4">
          <div className="grid gap-6 py-4">
            {/* Basic Interview Info */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    Applicant:{" "}
                    <span className="capitalize">{interview.studentName}</span>{" "}
                    ({interview.email})
                  </span>
                </div>
                <div className="flex items-center gap-2 capitalize">
                  <MapPin className="w-4 h-4" />
                  <span>Domain: {interview.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Date: {interview.date} at {interview.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 capitalize">
                  <CheckCircle className="w-4 h-4" />
                  <span>Status: {interview.status}</span>
                </div>
                {interview.adminName && (
                  <div className="flex items-center gap-2 capitalize">
                    <User className="w-4 h-4" />
                    <span>Conducted by: {interview.adminName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overall Score Section */}
            {typeof interview.score === "number" && (
              <Card>
                <CardHeader>
                  <CardTitle>Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">
                      {safeScore.toFixed(1)} / 5
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={scorePercentage}
                        className={`h-3 ${scoreColor}`}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {getPerformanceLabel(interview.score)} performance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>
                  Detailed performance across key skill areas (Score out of 5)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={skillData}
                  >
                    <PolarGrid stroke="#e5e7eb" strokeOpacity={0.5} />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tickCount={6}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)} / 5`,
                        name,
                      ]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Strengths and Areas for Development */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Lightbulb className="w-5 h-5" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {keyStrengths.length > 0 ? (
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      {keyStrengths.map((strength, i) => (
                        <li key={i}>
                          <span className="font-medium text-foreground">
                            {strength.name}:
                          </span>{" "}
                          {strength.score.toFixed(1)}/5
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No specific strengths identified yet.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <Target className="w-5 h-5" />
                    Areas for Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {areasForDevelopment.length > 0 ? (
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      {areasForDevelopment.map((area, i) => (
                        <li key={i}>
                          <span className="font-medium text-foreground">
                            {area.name}:
                          </span>{" "}
                          {area.score.toFixed(1)}/5
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No specific areas for development identified yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Interview Result Summary */}
            {interview.interviewResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Result Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {interview.interviewResult}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Interview Transcript */}
            {interview.interviewTranscript && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {interview.interviewTranscript}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* AI Generated Questions */}
            {interview.aiGeneratedQuestions &&
              interview.aiGeneratedQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Generated Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32 rounded-md border p-4">
                      <ul className="list-disc list-inside text-muted-foreground">
                        {interview.aiGeneratedQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

            {/* Custom Questions */}
            {interview.customQuestions &&
              interview.customQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32 rounded-md border p-4">
                      <ul className="list-disc list-inside text-muted-foreground">
                        {interview.customQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedReportModal;
