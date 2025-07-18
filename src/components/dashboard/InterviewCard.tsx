"use client";

import type React from "react";
import { useState } from "react";
import {
  Mail,
  Calendar,
  Clock,
  BookOpen,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bot,
  User,
  Play,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Interview } from "@/types";
import { useDispatch } from "react-redux";
import { addApplicant, updateInterviewer } from "@/lib/redux/slices/applicant";
import { useRouter } from "next/navigation";
import { setCurrentInterviewId } from "@/lib/redux/slices/user";

interface InterviewCardProps {
  interview: Interview;
  onEdit: (interview: Interview) => void;
  onDelete: (id: string) => void;
  userRole: "hr" | "candidate";
  onViewResults?: (interview: Interview) => void; // Added this prop
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  onEdit,
  onDelete,
  userRole,
  onViewResults,
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "upcoming":
        return { variant: "default" as const, icon: AlertCircle };
      case "completed":
        return { variant: "secondary" as const, icon: CheckCircle };
      case "cancelled":
        return { variant: "destructive" as const, icon: XCircle };
      default:
        return { variant: "outline" as const, icon: AlertCircle };
    }
  };

  const statusConfig = getStatusConfig(interview.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Check if interview is in the future
  const isUpcoming = () => {
    const now = new Date();
    const interviewDateTime = new Date(`${interview.date}T${interview.time}`);
    return interviewDateTime > now && interview.status === "upcoming";
  };

  const getActionButton = () => {
    if (interview.status === "cancelled") {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-muted-foreground bg-transparent"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancelled
        </Button>
      );
    }
    if (interview.status === "completed") {
      return (
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer hover:bg-muted bg-transparent"
          onClick={() => onViewResults && onViewResults(interview)} // Call onViewResults here
        >
          <Eye className="w-4 h-4 mr-2" />
          View Results
        </Button>
      );
    }
    if (isUpcoming()) {
      // HR users see interview details, candidates see start button
      if (userRole === "hr") {
        return (
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <Clock className="w-4 h-4 mr-2" />
            Scheduled
          </Button>
        );
      } else {
        // Candidate view - show start interview button with loader
        const handleStartInterview = async () => {
          setIsStarting(true);
          dispatch(addApplicant(interview));
          dispatch(updateInterviewer(interview));
          dispatch(setCurrentInterviewId(interview.id));
          // Simulate loading time
          await new Promise((resolve) => setTimeout(resolve, 2000));
          // Navigate to interview setup
          // window.location.href = "/interview-setup";
          router.push("/interview-setup");
        };
        return (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            onClick={handleStartInterview}
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Interview
              </>
            )}
          </Button>
        );
      }
    }
    // For past scheduled interviews that weren't completed
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-muted-foreground bg-transparent"
      >
        <Clock className="w-4 h-4 mr-2" />
        Concluded
      </Button>
    );
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-muted-foreground">
                {getInitials(interview.studentName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium capitalize">
                  {interview.studentName}
                </h3>
                <Badge
                  variant={statusConfig.variant}
                  className="text-xs capitalize"
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {interview.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {interview.type === "ai" ? (
                    <>
                      <Bot className="w-3 h-3 mr-1" />
                      AI
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Manual
                    </>
                  )}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{interview.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(interview.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{interview.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3 h-3" />
                  <span className="truncate capitalize">
                    {interview.domain}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Right side - Action Button and Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Action Button */}
            {getActionButton()}
            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(interview)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(interview.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewCard;
