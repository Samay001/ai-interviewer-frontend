"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react"; // Added Lucide icons
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentInterviewId, setUserInterviewCompletionStatus } from '@/lib/redux/slices/user';
import { updateInterviewStatus } from '@/services/operations/interview';
import { RootState } from '@/lib/redux/store';

interface InterviewResult {
  score: number;
  conclusion: string;
}

export default function InterviewResultPage() {
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const router = useRouter();
  const dispatch =useDispatch();
  const { currentInterviewId } = useSelector((state: RootState) => state.user);

  // Get transcript from localStorage only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTranscript = localStorage.getItem("interviewTranscriptText");
      if (storedTranscript) {
        setCurrentTranscript(storedTranscript);
        console.log("Using transcript from localStorage:", storedTranscript);
      } else {
        setError(
          "No interview transcript found. Please conduct an interview first."
        );
        setLoading(false);
      }
    }
  }, []);

  const analyzeInterview = async (transcriptText: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        "http://localhost:8080/interview/analyze",
        { text: transcriptText },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 30000,
          withCredentials: false,
        }
      );
      const data = response.data;
      if (data && typeof data.score !== "undefined" && data.conclusion) {
        setResult({
          score: data.score,
          conclusion: data.conclusion,
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("API call failed:", error);
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          setError("Request timed out. Please try again.");
        } else if (error.code === "ERR_NETWORK") {
          setError(
            "Network error. Please check if the server is running on port 8080."
          );
        } else if (error.response) {
          setError(
            `Server error: ${error.response.status} - ${
              error.response.data?.message || error.response.statusText
            }`
          );
        } else if (error.request) {
          setError(
            "No response from server. Please check your connection and server status."
          );
        } else {
          setError(`Request failed: ${error.message}`);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTranscript) {
      analyzeInterview(currentTranscript);
    }
  }, [currentTranscript]);

  const handleGoToDashboard = () => {
    // Clear transcript from localStorage before navigating
    if (typeof window !== "undefined") {
      localStorage.removeItem("interviewTranscriptText");
      localStorage.removeItem("interviewTranscript");
      console.log("Cleared transcript from localStorage");
    }

    if(result?.score){
      console.log("score generated")
      updateInterviewScore();
      dispatch(setUserInterviewCompletionStatus(true))
    }
    router.push('/candidate-dashboard');
  };
    
  // update user interview status to completed
  // useEffect(()=>{
    
  // },[result?.score])

  const updateInterviewScore = async () => {
    if (!currentInterviewId || result?.score === undefined || result?.score === null) {
      console.error('Missing interviewId or score for updateInterviewStatus');
      return;
    }

    console.log("current interview id",currentInterviewId)
    console.log("score",result.score)
    try {
      const response = await updateInterviewStatus({
        interviewId: currentInterviewId,
        score: result.score,
        interviewStatus: "completed"
      });

      dispatch(setCurrentInterviewId(null))
      console.log(response)
    } catch (error) {
      console.error(error);
    }
  }
  const handleRetry = () => {
    if (currentTranscript) {
      analyzeInterview(currentTranscript);
    }
  };

  const handleAnalyzeNew = () => {
    router.push("/interview"); // Redirect to interview page
  };

  // Score is out of 10, but we need to display it out of 5 for consistency with dashboard
  // Assuming the backend returns a score out of 10, we'll scale it down for display.
  // If the backend already returns 0-5, this scaling can be removed.
  const displayScore = result;
  const scorePercentage = result ? Math.round((result.score / 5) * 100) : 0;

  const getScoreColor = (score: number): string => {
    // Using Tailwind classes for colors
    if (score >= 8) return "text-green-500"; // Original 8-10 -> green
    if (score >= 6) return "text-yellow-500"; // Original 6-7.9 -> yellow
    if (score >= 4) return "text-orange-500"; // Original 4-5.9 -> orange
    return "text-red-500"; // Original <4 -> red
  };

  const getScoreBgColor = (score: number): string => {
    // Using Tailwind classes for background colors
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    if (score >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPerformanceLabel = (score: number): string => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Improvement";
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Interview Analysis
          </h1>
          <p className="text-muted-foreground">
            AI-powered interview performance evaluation
          </p>
        </div>

        {loading && (
          <Card className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <CardTitle className="text-lg font-semibold">
              Analyzing interview...
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please wait, this may take a moment.
            </CardDescription>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription className="mb-4">{error}</AlertDescription>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={handleRetry} variant="outline">
                Retry Analysis
              </Button>
              <Button onClick={handleAnalyzeNew}>New Interview</Button>
              <Button onClick={handleGoToDashboard} variant="secondary">
                Go to Dashboard
              </Button>
            </div>
          </Alert>
        )}

        {result && !loading && !error && (
          <div className="space-y-6">
            {/* Score Card */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  Interview Score
                </CardTitle>
                <CardDescription>
                  Overall performance evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="flex items-baseline mb-6">
                  <div
                    className={`text-6xl font-bold ${getScoreColor(
                      result.score
                    )}`}
                  >
                    {displayScore ? displayScore.score.toFixed(1) : "--"}
                  </div>
                  <div className="text-3xl text-muted-foreground ml-2">/ 5</div>
                </div>
                {/* Score Progress Bar */}
                <div className="w-full bg-muted rounded-full h-4 mb-4">
                  <Progress
                    value={scorePercentage}
                    className={`h-4 ${getScoreBgColor(result.score)}`}
                  />
                </div>
                <div className="text-center">
                  <span
                    className={`text-xl font-semibold ${getScoreColor(
                      result.score
                    )}`}
                  >
                    {getPerformanceLabel(result.score)}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scorePercentage >= 80
                      ? "Excellent performance!"
                      : scorePercentage >= 50
                      ? "Good performance, some areas for improvement."
                      : "Needs significant improvement."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Conclusion Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Detailed Analysis
                </CardTitle>
                <CardDescription>
                  AI-generated summary of the interview performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {result.conclusion}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button onClick={handleAnalyzeNew} size="lg">
                Analyze New Interview
              </Button>
              <Button onClick={handleGoToDashboard} size="lg" variant="outline">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
