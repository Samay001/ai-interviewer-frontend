"use client";
import type React from "react";
import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Trophy,
  BookOpen,
  Clock,
  MapPin,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Header from "@/components/dashboard/Header";
import InterviewCard from "@/components/dashboard/InterviewCard";
import InterviewResultModal from "@/components/dashboard/InterviewResultModal";
import DetailedReportModal from "@/components/dashboard/DetailedReportModal";
import type { Interview } from "@/types";
import Chatbot from "@/components/chatbot";
import { getInterviews } from "@/services/operations/auth";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { setUserInterviewCompletionStatus } from "@/lib/redux/slices/user";

const CandidateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "interviews" | "results"
  >("overview");
  const { user, interviewCompletionStatus } = useSelector(
    (state: RootState) => state.user
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  // New state for DetailedReportModal
  const [isDetailedReportModalOpen, setIsDetailedReportModalOpen] =
    useState(false);
  const [selectedDetailedInterview, setSelectedDetailedInterview] =
    useState<Interview | null>(null);

  const dispatch = useDispatch();

  const getCandidateInterviews = async (userId: string) => {
    try {
      const response = await getInterviews({ id: userId });
      setInterviews(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewResults = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsResultModalOpen(true);
  };

  // New handler for opening the detailed report modal
  const handleViewDetailedReport = (interview: Interview) => {
    setSelectedDetailedInterview(interview);
    setIsDetailedReportModalOpen(true);
  };

  useEffect(() => {
    console.log("user id", user?.id);
    if (user?.id) {
      // Ensure user.id exists before calling
      getCandidateInterviews(user.id);
    }
  }, [user?.id]); // Depend on user.id

  useEffect(() => {
    console.log("user id", user?.id);
    if (interviewCompletionStatus && user?.id) {
      // Check user.id here too
      console.log("interview updated", interviewCompletionStatus);
      getCandidateInterviews(user.id);
      dispatch(setUserInterviewCompletionStatus(false));
      console.log("redux updated", interviewCompletionStatus);
    }
  }, [interviewCompletionStatus, user?.id, dispatch]); // Depend on user.id and dispatch

  const handleEditInterview = (interview: Interview) => {
    console.log("View interview details:", interview);
  };

  const handleDeleteInterview = (id: string) => {
    console.log("Cannot delete interview:", id);
  };

  // Get next upcoming interview
  const getNextInterview = () => {
    const now = new Date();
    const upcomingInterviews = interviews
      .filter((interview) => {
        const interviewDateTime = new Date(
          `${interview.date}T${interview.time}`
        );
        return interviewDateTime > now && interview.status === "upcoming";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    return upcomingInterviews[0] || null;
  };

  const nextInterview = getNextInterview();

  // Format date and time for display
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = "";
    if (dateObj.toDateString() === today.toDateString()) {
      dateStr = "Today";
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      dateStr = "Tomorrow";
    } else {
      dateStr = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { dateStr, timeStr };
  };

  const completedInterviews = interviews.filter(
    (i) => i.status === "completed" && i.score !== undefined && i.score !== null
  );

  // Calculate average score dynamically
  const totalScore = completedInterviews.reduce(
    (sum, interview) => sum + (interview.score || 0),
    0
  );
  const averageScore =
    completedInterviews.length > 0
      ? Math.round((totalScore / completedInterviews.length / 5) * 100)
      : 0; // Fallback to 0 if no completed interviews

  const interviewTips = [
    {
      title: "Research the Company",
      description:
        "Learn about the company's mission, values, and recent developments.",
      icon: BookOpen,
    },
    {
      title: "Practice Common Questions",
      description: "Prepare answers for behavioral and technical questions.",
      icon: Target,
    },
    {
      title: "Prepare Questions",
      description: "Have thoughtful questions ready about the role and team.",
      icon: Lightbulb,
    },
    {
      title: "Test Your Setup",
      description:
        "Ensure your camera, microphone, and internet connection work well.",
      icon: CheckCircle,
    },
  ];

  // Helper functions for score colors (reused from DetailedReportModal)
  const getScoreColorClass = (score: number): string => {
    // Score is out of 5
    if (score >= 4) return "text-green-600"; // Corresponds to 80%+
    if (score >= 3) return "text-yellow-600"; // Corresponds to 60%+
    if (score >= 2) return "text-orange-600"; // Corresponds to 40%+
    return "text-red-600"; // Below 40%
  };

  const getScoreBgColorClass = (score: number): string => {
    // Score is out of 5
    if (score >= 4) return "bg-green-600";
    if (score >= 3) return "bg-yellow-600";
    if (score >= 2) return "bg-orange-600";
    return "bg-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Left side - Title and Tabs */}
          <div className="flex-1 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              My Dashboard
            </h1>
            <p className="text-muted-foreground mb-4">
              Track your interview progress and prepare for upcoming sessions
            </p>
            {/* Tabs positioned below the description */}
            <Tabs
              value={activeTab}
              onValueChange={(value: any) => setActiveTab(value as any)}
              className="w-full lg:w-[500px]"
            >
              <TabsList className="grid w-full grid-cols-3 h-12 p-1">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary/10"
                >
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="interviews"
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary/10"
                >
                  <Calendar className="w-4 h-4" />
                  Interviews
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary/10"
                >
                  <Trophy className="w-4 h-4" />
                  Results
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* Right side - Next Interview Banner */}
          <div className="lg:w-80">
            {nextInterview ? (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800 h-full py-0">
                <CardContent className="p-4 h-full flex flex-col justify-center py-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-green-900 dark:text-green-100">
                          Upcoming Interview
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        >
                          {nextInterview.type === "ai" ? "AI" : "Manual"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {
                              formatDateTime(
                                nextInterview.date,
                                nextInterview.time
                              ).dateStr
                            }{" "}
                            at{" "}
                            {
                              formatDateTime(
                                nextInterview.date,
                                nextInterview.time
                              ).timeStr
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {nextInterview.domain}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700 h-full">
                <CardContent className="p-4 h-full flex flex-col justify-center">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                        No Upcoming Interviews
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your next interview will appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value: any) => setActiveTab(value as any)}
          className="space-y-6"
        >
          <TabsContent value="overview" className="space-y-6 animate-slide-up">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Interviews
                      </p>
                      <p className="text-2xl font-bold">{interviews.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Completed
                      </p>
                      <p className="text-2xl font-bold">
                        {completedInterviews.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Average Score
                      </p>
                      <p className="text-2xl font-bold">
                        {completedInterviews.length > 0
                          ? `${averageScore}%`
                          : "0%"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Interview Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Interview Tips
                </CardTitle>
                <CardDescription>
                  Helpful tips to ace your next interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interviewTips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <tip.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Recent Interviews */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Interviews</CardTitle>
                    <CardDescription>
                      Your latest interview activities
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{interviews.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {interviews.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Interviews Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your interview activities will appear here once you have a
                      scheduled interview
                    </p>
                  </div>
                ) : (
                  interviews
                    .sort(
                      (a, b) =>
                        new Date(`${b.date}T${b.time}`).getTime() -
                        new Date(`${a.date}T${a.time}`).getTime()
                    )
                    .slice(0, 3)
                    .map((interview, index) => (
                      <InterviewCard
                        key={index}
                        interview={interview}
                        onEdit={handleEditInterview}
                        onDelete={handleDeleteInterview}
                        userRole="candidate"
                        onViewResults={handleViewResults}
                      />
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent
            value="interviews"
            className="space-y-6 animate-slide-up"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Interviews</CardTitle>
                  <Badge variant="outline">{interviews.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {interviews.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Interviews Scheduled
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any interviews scheduled yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your scheduled interviews will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interviews
                      .sort(
                        (a, b) =>
                          new Date(`${b.date}T${b.time}`).getTime() -
                          new Date(`${a.date}T${a.time}`).getTime()
                      )
                      .map((interview) => (
                        <InterviewCard
                          key={interview.id}
                          interview={interview}
                          onEdit={handleEditInterview}
                          onDelete={handleDeleteInterview}
                          userRole="candidate"
                          onViewResults={handleViewResults}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="results" className="space-y-6 animate-slide-up">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Technical Skills</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Communication</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Problem Solving</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Score</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Algorithm Complexity
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Focus on time and space complexity analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        System Design
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Practice designing scalable systems
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Completed Interviews Results */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Results</CardTitle>
                <CardDescription>
                  Detailed results from your completed interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No completed interviews yet
                    </h3>
                    <p className="text-muted-foreground">
                      Your interview results will appear here after completion
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedInterviews.map((interview) => {
                      // Calculate percentage from score (out of 5)
                      const displayScorePercentage = Math.round(
                        ((interview.score !== undefined ? interview.score : 0) /
                          5) *
                          100
                      );
                      return (
                        <div
                          key={interview.id}
                          className="p-4 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium capitalize">
                                {interview.domain}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {
                                  formatDateTime(interview.date, interview.time)
                                    .dateStr
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-2xl font-bold ${getScoreColorClass(
                                  interview.score || 0
                                )}`}
                              >
                                {displayScorePercentage}%
                              </div>
                              <Badge variant="secondary">
                                {displayScorePercentage >= 60
                                  ? "Passed"
                                  : "Failed"}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall Score</span>
                              <span>{displayScorePercentage}%</span>
                            </div>
                            <Progress
                              value={displayScorePercentage}
                              className={`h-1 ${getScoreBgColorClass(
                                interview.score || 0
                              )}`}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer mt-3 bg-transparent"
                            onClick={() => handleViewDetailedReport(interview)} // Changed to open DetailedReportModal
                          >
                            View Detailed Report
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Chatbot />
        {/* Existing Interview Result Modal */}
        <InterviewResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          interview={selectedInterview}
        />
        {/* New Detailed Report Modal */}
        <DetailedReportModal
          isOpen={isDetailedReportModalOpen}
          onClose={() => setIsDetailedReportModalOpen(false)}
          interview={selectedDetailedInterview}
        />
      </main>
    </div>
  );
};

export default CandidateDashboard;
