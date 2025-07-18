"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Plus,
  Search,
  Users,
  Calendar,
  CheckCircle,
  Bot,
  Clock,
  User,
  MapPin,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import InterviewTrendsChart from "@/components/dashboard/InterviewTrendsChart";
import DomainDistributionChart from "@/components/dashboard/DomainDistributionChart";
import StatusDistributionChart from "@/components/dashboard/StatusDistributionChart";
import InterviewPerformanceChart from "@/components/dashboard/InterviewPerformanceChart";
import ScheduleForm from "@/components/dashboard/ScheduleForm";
import InterviewCard from "@/components/dashboard/InterviewCard";
import InterviewResultModal from "@/components/dashboard/InterviewResultModal";
import type { Interview, NewInterview } from "@/types";
import Chatbot from "@/components/chatbot";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { getInterviews } from "@/services/operations/auth";
import { setHrInterviewScheduleStatus } from "@/lib/redux/slices/user";

// Empty State Component for No Interviews
const NoInterviewsEmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ title, description, actionLabel, onAction, icon: Icon = Calendar }) => (
  <div className="text-center py-12 px-4">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} className="gap-2 cursor-pointer">
        <Plus className="w-4 h-4" />
        {actionLabel}
      </Button>
    )}
  </div>
);

// Loading State Component
const LoadingState: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="flex items-center space-x-4 p-4 border rounded-lg">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
          <div className="w-20 h-6 bg-muted rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

const HRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "interviews" | "schedule"
  >("dashboard");
  const [scheduleType, setScheduleType] = useState<"manual" | "ai">("manual");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, hrInterviewScheduleStatus } = useSelector(
    (state: RootState) => state.user
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const dispatch = useDispatch();

  // State for Interview Result Modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );

  const getHrInterviews = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await getInterviews({ id: userId });
      // console.log("Fetched interviews:", response);
      setInterviews(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("user id", user?.id);
    if (hrInterviewScheduleStatus) {
      console.log("hr scheduled new interview, calling backend");
      getHrInterviews(user.id!);
      dispatch(setHrInterviewScheduleStatus(false));
    }
  }, [hrInterviewScheduleStatus]);

  const [newInterview, setNewInterview] = useState<NewInterview>({
    applicantFirstName: "",
    applicantLastName: "",
    email: "",
    date: "",
    time: "",
    domain: "",
    questions: "",
    resume: undefined as unknown as File,
  });

  useEffect(() => {
    console.log("HR id", user?.id);
    if (user?.id) {
      getHrInterviews(user.id);
    }
  }, [user?.id]);

  const handleInputChange = (field: keyof NewInterview, value: string) => {
    setNewInterview((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScheduleInterview = () => {
    // Create a mock Interview object that matches the NEW API structure for local state
    const interview: Interview = {
      id: Date.now().toString(), // Mock ID
      studentName: `${newInterview.applicantFirstName} ${newInterview.applicantLastName}`,
      email: newInterview.email,
      date: newInterview.date,
      time: newInterview.time,
      domain: newInterview.domain,
      type: scheduleType,
      status: "upcoming",
      score: 0, // Default score for new interviews
      adminName: `${user?.firstName || "Admin"} ${user?.lastName || "User"}`,
      interviewTranscript: "",
      interviewResult: "",
      customQuestions: newInterview.questions ? [newInterview.questions] : [],
      aiGeneratedQuestions: [],
    };

    setInterviews((prev) => [...prev, interview]);
    setNewInterview({
      applicantFirstName: "",
      applicantLastName: "",
      email: "",
      date: "",
      time: "",
      domain: "",
      questions: "",
      resume: undefined as unknown as File,
    });
  };

  const handleEditInterview = (interview: Interview) => {
    console.log("Edit interview:", interview);
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews((prev) => prev.filter((interview) => interview.id !== id));
  };

  const handleViewResults = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsResultModalOpen(true);
  };

  const uniqueDomains = [
    ...new Set(interviews.map((interview) => interview.domain.toLowerCase())),
  ].filter((domain) => domain);

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain =
      filterDomain === "all" ||
      interview.domain.toLowerCase() === filterDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  // Calculate dynamic trends for StatsCard
  const calculateTrend = (currentValue: number, previousValue: number) => {
    if (previousValue === 0) return { trend: "N/A", isPositive: true }; // Avoid division by zero
    const percentageChange =
      ((currentValue - previousValue) / previousValue) * 100;
    const isPositive = percentageChange >= 0;
    return {
      trend: `${isPositive ? "+" : ""}${percentageChange.toFixed(1)}%`,
      isPositive,
    };
  };

  // Mock previous month's data for trend calculation (replace with actual data fetching if available)
  const mockPreviousMonthStats = {
    totalInterviews: Math.max(1, interviews.length - 5), // Example: 5 less than current
    scheduledInterviews: Math.max(
      1,
      interviews.filter((i) => i.status === "upcoming").length - 2
    ),
    completedInterviews: Math.max(
      1,
      interviews.filter((i) => i.status === "completed").length - 3
    ),
    aiInterviews: Math.max(
      1,
      interviews.filter((i) => i.type === "ai").length - 1
    ),
  };

  const stats = {
    totalInterviews: interviews.length,
    scheduledInterviews: interviews.filter((i) => i.status === "upcoming")
      .length,
    completedInterviews: interviews.filter((i) => i.status === "completed")
      .length,
    aiInterviews: interviews.filter((i) => i.type === "ai").length,
  };

  const totalTrend = calculateTrend(
    stats.totalInterviews,
    mockPreviousMonthStats.totalInterviews
  );
  const scheduledTrend = calculateTrend(
    stats.scheduledInterviews,
    mockPreviousMonthStats.scheduledInterviews
  );
  const completedTrend = calculateTrend(
    stats.completedInterviews,
    mockPreviousMonthStats.completedInterviews
  );
  const aiTrend = calculateTrend(
    stats.aiInterviews,
    mockPreviousMonthStats.aiInterviews
  );

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

  // Get past interviews for overview
  const getPastInterviews = () => {
    const now = new Date();
    return interviews
      .filter((interview) => {
        const interviewDateTime = new Date(
          `${interview.date}T${interview.time}`
        );
        return interviewDateTime < now;
      })
      .sort(
        (a, b) =>
          new Date(`${b.date}T${b.time}`).getTime() -
          new Date(`${a.date}T${a.time}`).getTime()
      );
  };

  // Get upcoming interview for overview
  const getUpcomingInterviewForOverview = () => {
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

  const pastInterviews = getPastInterviews();
  const upcomingInterviewForOverview = getUpcomingInterviewForOverview();
  const overviewInterviews = upcomingInterviewForOverview
    ? [upcomingInterviewForOverview, ...pastInterviews]
    : pastInterviews;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Left side - Title and Tabs */}
          <div className="flex-1 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              CandidateFlow
            </h1>
            <p className="text-muted-foreground mb-4">
              Manage interviews, track performance, and schedule new sessions
            </p>
            {/* Tabs positioned below the description */}
            <Tabs
              value={activeTab}
              onValueChange={(value: any) => setActiveTab(value as any)}
              className="w-full lg:w-[500px]"
            >
              <TabsList className="grid w-full grid-cols-3 h-12 p-1">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary/10"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="interviews"
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary/10"
                >
                  <CalendarDays className="w-4 h-4" />
                  Interviews
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* Right side - Next Interview Banner */}
          <div className="lg:w-80">
            {nextInterview ? (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800 h-full py-0">
                <CardContent className="p-4 h-full flex flex-col justify-center py-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                          Next Interview
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        >
                          {nextInterview.type === "ai" ? "AI" : "Manual"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-blue-800 dark:text-blue-200">
                          <User className="w-3 h-3" />
                          <span className="truncate">
                            {nextInterview.studentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300">
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
                        <div className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300">
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
                        Schedule your next interview to see it here
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
          <TabsContent value="dashboard" className="space-y-6 animate-slide-up">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Interviews"
                value={stats.totalInterviews}
                icon={Users}
                trend={totalTrend.trend}
                trendLabel="from last month"
                isPositive={totalTrend.isPositive}
              />
              <StatsCard
                title="Scheduled"
                value={stats.scheduledInterviews}
                icon={Calendar}
                trend={scheduledTrend.trend}
                trendLabel="from last month"
                isPositive={scheduledTrend.isPositive}
              />
              <StatsCard
                title="Completed"
                value={stats.completedInterviews}
                icon={CheckCircle}
                trend={completedTrend.trend}
                trendLabel="from last month"
                isPositive={completedTrend.isPositive}
              />
              <StatsCard
                title="AI Interviews"
                value={stats.aiInterviews}
                icon={Bot}
                trend={aiTrend.trend}
                trendLabel="from last month"
                isPositive={aiTrend.isPositive}
              />
            </div>
            {/* Conditional rendering based on whether there are interviews */}
            {isLoading ? (
              // Show loading state while fetching data
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <LoadingState />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <LoadingState />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <LoadingState />
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <LoadingState />
                  </CardContent>
                </Card>
              </div>
            ) : interviews.length === 0 ? (
              // Complete empty state for dashboard when no interviews exist
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <NoInterviewsEmptyState
                      title="Welcome to CandidateFlow"
                      description="Get started by scheduling your first interview. You'll be able to track performance, manage candidates, and analyze interview trends once you have some data."
                      actionLabel="Schedule First Interview"
                      onAction={() => setActiveTab("schedule")}
                      icon={TrendingUp}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Show charts and data when interviews exist
              <>
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <DomainDistributionChart interviews={interviews} />
                  <StatusDistributionChart interviews={interviews} />
                  <InterviewPerformanceChart interviews={interviews} />
                </div>
                {/* Full Width Line Chart */}
                <div className="w-full">
                  <InterviewTrendsChart interviews={interviews} />
                </div>
                {/* Recent Interviews */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Interviews</CardTitle>
                        <CardDescription>
                          Latest interview activities
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {overviewInterviews.length} total
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {overviewInterviews.length === 0 ? (
                      <NoInterviewsEmptyState
                        title="No Recent Interviews"
                        description="Your recent interview activity will appear here once you start scheduling and conducting interviews."
                        actionLabel="Schedule Interview"
                        onAction={() => setActiveTab("schedule")}
                        icon={FileText}
                      />
                    ) : (
                      <div className="space-y-3">
                        {overviewInterviews.map((interview) => (
                          <InterviewCard
                            key={interview.id}
                            interview={interview}
                            onEdit={handleEditInterview}
                            onDelete={handleDeleteInterview}
                            userRole="hr"
                            onViewResults={handleViewResults}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          <TabsContent
            value="interviews"
            className="space-y-6 animate-slide-up"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search interviews..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterDomain} onValueChange={setFilterDomain}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="All domains" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All domains</SelectItem>
                      {uniqueDomains.map((domain) => (
                        <SelectItem
                          key={domain}
                          value={domain}
                          className="capitalize"
                        >
                          {domain.charAt(0).toUpperCase() + domain.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Interviews</CardTitle>
                  <Badge variant="outline">
                    {filteredInterviews.length} found
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingState />
                ) : interviews.length === 0 ? (
                  <NoInterviewsEmptyState
                    title="No Interviews Yet"
                    description="Start building your interview pipeline by scheduling your first interview. You'll be able to manage all your interviews from this central location."
                    actionLabel="Schedule Your First Interview"
                    onAction={() => setActiveTab("schedule")}
                    icon={Calendar}
                  />
                ) : filteredInterviews.length === 0 ? (
                  <NoInterviewsEmptyState
                    title="No interviews found"
                    description="Try adjusting your search criteria or filters to find the interviews you're looking for."
                    icon={Search}
                  />
                ) : (
                  <div className="space-y-3">
                    {[...filteredInterviews]
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
                          userRole="hr"
                          onViewResults={handleViewResults}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedule" className="animate-slide-up">
            <ScheduleForm
              scheduleType={scheduleType}
              setScheduleType={setScheduleType}
              newInterview={newInterview}
              onInputChange={handleInputChange}
              onSubmit={handleScheduleInterview}
            />
          </TabsContent>
        </Tabs>
        {/* General Chatbot for other sections */}
        <Chatbot />

        {/* Interview Result Modal */}
        <InterviewResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          interview={selectedInterview}
        />
      </main>
    </div>
  );
};

export default HRDashboard;
