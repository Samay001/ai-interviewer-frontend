"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Bot,
  User,
  Plus,
  Sparkles,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  CalendarIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { NewInterview } from "@/types";
import VapiWidget from "@/components/dashboard/VapiWidget";
import {
  scheduleInterview,
  uploadResume,
  generateResumeQuestions,
  updateUserInterviewSchema,
  generateDomainQuestions,
} from "@/services/operations/interview";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setHrInterviewScheduleStatus } from "@/lib/redux/slices/user";

interface ScheduleFormProps {
  scheduleType: "manual" | "ai";
  setScheduleType: (type: "manual" | "ai") => void;
  newInterview: NewInterview;
  onInputChange: (field: keyof NewInterview, value: string) => void;
  onSubmit: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  scheduleType,
  setScheduleType,
  newInterview,
  onInputChange,
  onSubmit,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [aiScheduleSuccess, setAiScheduleSuccess] = useState<string>("");
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  // State for custom time picker
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [selectedMinute, setSelectedMinute] = useState<string>("");
  const [selectedAmPm, setSelectedAmPm] = useState<"AM" | "PM">("AM");

  // State for date picker popover open/close
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Effect to parse newInterview.time into hour, minute, ampm for display
  useEffect(() => {
    if (newInterview.time) {
      const [hourStr, minuteStr] = newInterview.time.split(":");
      let hour = Number.parseInt(hourStr, 10);
      let ampm: "AM" | "PM" = "AM";

      if (hour >= 12) {
        ampm = "PM";
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12; // 00:xx is 12 AM

      setSelectedHour(hour.toString().padStart(2, "0"));
      setSelectedMinute(minuteStr);
      setSelectedAmPm(ampm);
    } else {
      setSelectedHour("");
      setSelectedMinute("");
      setSelectedAmPm("AM");
    }
  }, [newInterview.time]);

  // Function to update newInterview.time based on selected hour, minute, ampm
  const updateInterviewTime = (
    hour: string,
    minute: string,
    ampm: "AM" | "PM"
  ) => {
    if (hour && minute) {
      let h = Number.parseInt(hour, 10);
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0; // 12 AM is 00:xx

      const formattedHour = h.toString().padStart(2, "0");
      onInputChange("time", `${formattedHour}:${minute}`);
    } else {
      onInputChange("time", "");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    // File size validation (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size must be less than 5MB");
      setSelectedFile(null);
      return;
    }
    // File type validation
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Please upload a PDF, DOC, or DOCX file");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError("");
    // Reset the file input
    const fileInput = document.getElementById("resume") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const handleScheduleSubmit = async () => {
    if (!selectedFile) {
      setError("Please upload a resume");
      return;
    }
    if (!selectedHour || !selectedMinute) {
      setError("Please select a valid time");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      // Step 1: Upload resume
      const resumeResponse = await uploadResume(selectedFile);
      console.log("Resume uploaded:", resumeResponse);
      const { text, ...cleanedResumeData } = resumeResponse;
      const payload = { text };

      // Step 2: Generate questions from resume
      const questionsResponse = await generateResumeQuestions(payload);

      const domainQuestionsResponse = await generateDomainQuestions({
        domain: newInterview.domain,
      });

      const resumeQuestions = questionsResponse.questions?.slice(0, 3) || [];
      const domainQuestions =
        domainQuestionsResponse.questions?.slice(0, 2) || [];

      const combinedQuestions = [...resumeQuestions, ...domainQuestions];

      // Convert manual custom questions string to array
      const manualCustomQuestionsArray = (newInterview.questions ?? "")
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q !== "");

      // Step 3: Schedule the interview
      const scheduleData = {
        adminFirstName: user?.firstName || "", // Use user from Redux
        adminLastName: user?.lastName || "", // Use user from Redux
        adminEmail: user?.email || "", // Use user from Redux
        applicantFirstName: newInterview.applicantFirstName, // Use separate first name
        applicantLastName: newInterview.applicantLastName, // Use separate last name
        applicantEmail: newInterview.email,
        date: newInterview.date,
        time: newInterview.time, // Use the time from state
        interviewDomain: newInterview.domain,
        scheduleType,
        customQuestions: manualCustomQuestionsArray, // Use questions from manual input as array
        aiGeneratedQuestions: combinedQuestions,
      };

      const scheduleResponse = await scheduleInterview(scheduleData);
      console.log("Interview scheduled:", scheduleResponse);

      const updatedInterviewSchema = await updateUserInterviewSchema({
        email: user?.email,
        interviewId: scheduleResponse._id.toString(),
      });
      await updateUserInterviewSchema({
        email: newInterview?.email,
        interviewId: scheduleResponse._id.toString(),
      });
      console.log("Interview schema updated:", updatedInterviewSchema);
      console.log("setting hr intervie status");
      dispatch(setHrInterviewScheduleStatus(true));

      setSuccess(
        "Interview scheduled successfully! Resume uploaded and questions generated."
      );
      // Call the original onSubmit callback
      // onSubmit();
    } catch (error: any) {
      console.error("Error in interview scheduling process:", error);
      setError(
        error.message || "Failed to schedule interview. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle AI scheduling completion
  const handleAIScheduleComplete = (data: any) => {
    console.log("AI Scheduling completed:", data);
    setAiScheduleSuccess(
      `🎉 AI Interview scheduled successfully for ${data.schedulingData.applicantFirstName} ${data.schedulingData.applicantLastName}!`
    );
    dispatch(setHrInterviewScheduleStatus(true));

    // Call the original onSubmit callback to refresh the interviews list
    onSubmit();
    // Clear success message after 5 seconds
    setTimeout(() => {
      setAiScheduleSuccess("");
    }, 5000);
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <div className="space-y-6">
      {/* Scheduling Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduling Method</CardTitle>
          <CardDescription>
            Choose how you'd like to schedule the interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                scheduleType === "manual" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setScheduleType("manual")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      scheduleType === "manual"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Manual</h3>
                      {scheduleType === "manual" && <Badge>Selected</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Custom scheduling with manual questions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                scheduleType === "ai" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setScheduleType("ai")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      scheduleType === "ai"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">AI Powered</h3>
                      {scheduleType === "ai" && <Badge>Selected</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automated scheduling with AI questions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {scheduleType === "ai" ? (
            <div className="space-y-6">
              {/* AI Success Message */}
              {aiScheduleSuccess && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {aiScheduleSuccess}
                  </AlertDescription>
                </Alert>
              )}
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    AI-Powered Scheduling
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Use our AI voice assistant to schedule interviews naturally
                    through conversation. The AI will extract all necessary
                    information and handle the complete scheduling process.
                  </p>
                </div>
                {/* Enhanced VapiWidget for AI Scheduling */}
                <div className="flex justify-center mt-6">
                  <VapiWidget
                    config={{
                      embedded: true,
                      purpose: "scheduling",
                    }}
                    onScheduleComplete={handleAIScheduleComplete}
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-left">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        How AI Scheduling Works:
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Click "Start Interview Scheduling" to begin</li>
                        <li>
                          • Provide candidate and admin details through
                          conversation
                        </li>
                        <li>• Upload resume when prompted</li>
                        <li>
                          • AI generates questions and schedules automatically
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                  <Bot className="w-4 h-4" />
                  <span>Powered by advanced AI conversation technology</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Manual Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the interview details
                  </p>
                </div>
              </div>
              {/* Error and Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicantFirstName">
                    Applicant First Name *
                  </Label>
                  <Input
                    id="applicantFirstName"
                    placeholder="Enter applicant's first name"
                    value={newInterview.applicantFirstName}
                    onChange={(e) =>
                      onInputChange("applicantFirstName", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantLastName">
                    Applicant Last Name *
                  </Label>
                  <Input
                    id="applicantLastName"
                    placeholder="Enter applicant's last name"
                    value={newInterview.applicantLastName}
                    onChange={(e) =>
                      onInputChange("applicantLastName", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Applicant Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter applicant's email address"
                    value={newInterview.email}
                    onChange={(e) => onInputChange("email", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {/* Admin fields removed as they are pulled from Redux */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newInterview.date && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newInterview.date ? (
                          format(new Date(newInterview.date), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          newInterview.date
                            ? new Date(newInterview.date)
                            : undefined
                        }
                        onSelect={(date) => {
                          onInputChange(
                            "date",
                            date ? format(date, "yyyy-MM-dd") : ""
                          );
                          setIsDatePickerOpen(false); // Close the popover after selection
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedHour}
                      onValueChange={(value) => {
                        setSelectedHour(value);
                        updateInterviewTime(
                          value,
                          selectedMinute,
                          selectedAmPm
                        );
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedMinute}
                      onValueChange={(value) => {
                        setSelectedMinute(value);
                        updateInterviewTime(selectedHour, value, selectedAmPm);
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedAmPm}
                      onValueChange={(value: "AM" | "PM") => {
                        setSelectedAmPm(value);
                        updateInterviewTime(
                          selectedHour,
                          selectedMinute,
                          value
                        );
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    placeholder="e.g., Frontend Development, Data Science"
                    value={newInterview.domain}
                    onChange={(e) => onInputChange("domain", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {/* Resume Upload Field */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="resume">Resume *</Label>
                  <div className="space-y-3">
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Upload Resume</p>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOC, or DOCX (Max 5MB)
                            </p>
                          </div>
                          <Input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("resume")?.click()
                            }
                            className="cursor-pointer"
                            disabled={isLoading}
                          >
                            Choose File
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="cursor-pointer"
                            disabled={isLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {fileError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{fileError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="questions">Custom Questions (Optional)</Label>
                  <Textarea
                    id="questions"
                    rows={4}
                    placeholder="Enter custom questions (one per line)..."
                    value={newInterview.questions}
                    onChange={(e) => onInputChange("questions", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleScheduleSubmit}
                  size="lg"
                  disabled={
                    !selectedFile ||
                    isLoading ||
                    !selectedHour ||
                    !selectedMinute
                  }
                  className="cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleForm;
