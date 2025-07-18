{
  ("use client");
}
import type React from "react";
import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import {
  Mic,
  PhoneOff,
  MessageSquare,
  Download,
  Trash2,
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  scheduleInterview,
  uploadResume,
  generateResumeQuestions,
  updateUserInterviewSchema,
  generateDomainQuestions,
} from "@/services/operations/interview";
import { schedulerAssistant } from "@/constants/scheduler-assistant"; // Corrected import path
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
// Import date-fns for robust date/time parsing
import {
  parse,
  format,
  isValid,
  parseISO,
  addDays,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
} from "date-fns";
import { enUS } from "date-fns/locale";

interface TranscriptMessage {
  role: string;
  text: string;
  timestamp: Date;
  id: string;
}

interface VapiWidgetProps {
  config?: {
    embedded?: boolean;
    purpose?: string;
    [key: string]: unknown;
  };
  onScheduleComplete?: (data: any) => void;
}

interface SchedulingData {
  applicantFirstName: string;
  applicantLastName: string;
  email: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  date: string;
  time: string;
  domain: string;
  customQuestions: string[]; // Changed to string array
  isComplete: boolean;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({
  config = {},
  onScheduleComplete,
}) => {
  const isEmbedded = config.embedded === true;
  const purpose = config.purpose || "general";

  // VAPI instance - create once and reuse
  const vapiRef = useRef<Vapi | null>(null);

  // Simple state management
  const [callStatus, setCallStatus] = useState<
    "inactive" | "connecting" | "active" | "ended"
  >("inactive");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scheduleError, setScheduleError] = useState<string>("");
  const [scheduleSuccess, setScheduleSuccess] = useState<string>("");
  const [processingStep, setProcessingStep] = useState<string>("");
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false);

  interface ReduxUser {
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  }
  const { user } = useSelector((state: RootState) => state.user) as {
    user: ReduxUser;
  };

  // Scheduling data state - now populated by AI function call or regex fallback
  const [schedulingData, setSchedulingData] = useState<SchedulingData>({
    applicantFirstName: "",
    applicantLastName: "",
    email: "",
    adminFirstName: user?.firstName || "", // Initialize from Redux user
    adminLastName: user?.lastName || "", // Initialize from Redux user
    adminEmail: user?.email || "", // Initialize from Redux user
    date: "",
    time: "",
    domain: "",
    customQuestions: [], // Initialize as empty array
    isComplete: false,
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize VAPI once
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_VAPI_API_KEY) {
      setError("VAPI API key is missing");
      return;
    }
    if (!vapiRef.current) {
      console.log("🚀 Creating VAPI instance...");
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
      console.log("✅ VAPI instance created");
    }

    return () => {
      // Cleanup on unmount
      if (vapiRef.current && callStatus === "active") {
        console.log("🧹 Cleaning up VAPI on unmount");
        try {
          vapiRef.current.stop();
        } catch (e) {
          console.error("Error stopping VAPI:", e);
        }
      }
    };
  }, [callStatus]);

  // Helper functions for formatting for display
  const formatDateForDisplay = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, "PPP", { locale: enUS }) : dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatTimeForDisplay = (timeStr: string): string => {
    try {
      // Assuming timeStr is HH:MM (24-hour) from AI or parsing
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return isValid(date) ? format(date, "h:mm a", { locale: enUS }) : timeStr;
    } catch {
      return timeStr;
    }
  };

  // --- NEW: Robust Date/Time Parsing Function ---
  const parseDateTimeFromText = (
    text: string
  ): { date?: string; time?: string } => {
    const result: { date?: string; time?: string } = {};
    const lowerText = text.toLowerCase();
    const now = new Date(); // Reference date for parsing relative dates

    console.log("DATE_TIME_PARSING: Attempting to parse from text:", lowerText);

    // Pre-process text for date parsing: remove common ordinal suffixes
    const cleanedText = lowerText.replace(/(\d+)(st|nd|rd|th)\b/g, "$1");
    console.log(
      "DATE_TIME_PARSING: Cleaned text for date parsing:",
      cleanedText
    );

    // --- Date Parsing ---
    const dateFormats = [
      "yyyy-MM-dd", // 2025-08-08
      "MM/dd/yyyy", // 08/08/2025
      "dd/MM/yyyy", // 08/08/2025 (date-fns handles ambiguity better than regex)
      "MMMM d, yyyy", // August 8, 2025 (removed 'do' as we pre-process ordinals)
      "d MMMM yyyy", // 8 August 2025
      "MMMM yyyy", // August 2025 (assume 1st of month)
      "M/d/yyyy", // 8/8/2025
      "M-d-yyyy", // 8-8-2025
      "MMMM d", // August 8 (assume current year)
      "d MMMM", // 8 August (assume current year)
      "M/d", // 8/8 (assume current year)
      "dd/MM", // 08/08 (assume current year)
      "yyyy/MM/dd", // 2025/08/08
      "yyyy.MM.dd", // 2025.08.08
      "MMMM", // August (assume 1st of month, current year)
      "d", // 8 (assume current month, current year) - use with caution, might be too broad
    ];

    for (const fmt of dateFormats) {
      const parsedDate = parse(cleanedText, fmt, now, { locale: enUS });
      if (isValid(parsedDate)) {
        result.date = format(parsedDate, "yyyy-MM-dd");
        console.log(
          `DATE_TIME_PARSING: Parsed date '${result.date}' using format '${fmt}' from cleaned text.`
        );
        break;
      }
    }

    // Handle relative dates if not already found
    if (!result.date) {
      if (lowerText.includes("today")) {
        result.date = format(now, "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'today'");
      } else if (lowerText.includes("tomorrow")) {
        result.date = format(addDays(now, 1), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'tomorrow'");
      } else if (lowerText.includes("next monday")) {
        result.date = format(nextMonday(now), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'next monday'");
      } else if (lowerText.includes("next tuesday")) {
        result.date = format(nextTuesday(now), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'next tuesday'");
      } else if (lowerText.includes("next wednesday")) {
        result.date = format(nextWednesday(now), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'next wednesday'");
      } else if (lowerText.includes("next thursday")) {
        result.date = format(nextThursday(now), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'next thursday'");
      } else if (lowerText.includes("next friday")) {
        result.date = format(nextFriday(now), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'next friday'");
      } else if (lowerText.includes("next saturday")) {
        result.date = format(nextSaturday(now), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'next saturday'");
      } else if (lowerText.includes("next sunday")) {
        result.date = format(nextSunday(now), "yyyy-MM-dd");
        console.log("DATE_TIME_PARSING: Parsed date 'next sunday'");
      }

      // "in X days"
      const inXDaysMatch = lowerText.match(/in (\d+) days?/);
      if (inXDaysMatch) {
        const days = Number.parseInt(inXDaysMatch[1]);
        result.date = format(addDays(now, days), "yyyy-MM-dd");
        console.log(`DATE_TIME_PARSING: Parsed date 'in ${days} days'`);
      }

      // "in X weeks"
      const inXWeeksMatch = lowerText.match(/in (\d+) weeks?/);
      if (inXWeeksMatch) {
        const weeks = Number.parseInt(inXWeeksMatch[1]);
        result.date = format(addDays(now, weeks * 7), "yyyy-MM-dd");
        console.log(`DATE_TIME_PARSING: Parsed date 'in ${weeks} weeks'`);
      }
    }

    // --- Time Parsing --- (Keep as is, seems to be working)
    const timeFormats = [
      "h:mm a", // 4:00 PM, 10:30 AM
      "h a", // 4 PM, 10 AM (assume :00)
      "HH:mm", // 16:00, 09:30
      "H:mm", // 9:30 (no leading zero)
      "HHmm", // 1600, 0930 (no colon)
      "Hmm", // 930 (no leading zero, no colon)
    ];

    for (const fmt of timeFormats) {
      const parsedTime = parse(lowerText, fmt, now, { locale: enUS });
      if (isValid(parsedTime)) {
        result.time = format(parsedTime, "HH:mm");
        console.log(
          `DATE_TIME_PARSING: Parsed time '${result.time}' using format '${fmt}'`
        );
        break;
      }
    }

    // Handle specific time phrases if not already found
    if (!result.time) {
      if (lowerText.includes("noon")) {
        result.time = "12:00";
        console.log("DATE_TIME_PARSING: Parsed time 'noon'");
      } else if (lowerText.includes("midnight")) {
        result.time = "00:00";
        console.log("DATE_TIME_PARSING: Parsed time 'midnight'");
      }
    }

    console.log("DATE_TIME_PARSING: Final result:", result);
    return result;
  };
  // --- END: Robust Date/Time Parsing Function ---

  // Start call function
  const startCall = async () => {
    if (!process.env.NEXT_PUBLIC_VAPI_API_KEY) {
      setError("VAPI API key is missing");
      return;
    }
    if (!vapiRef.current) {
      console.log("🚀 Creating VAPI instance...");
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
      console.log("✅ VAPI instance created");
    }

    if (callStatus !== "inactive") {
      console.log("⚠️ Call already in progress, status:", callStatus);
      return;
    }

    console.log("🚀 Starting call...");
    setCallStatus("connecting");
    setError("");
    setMessages([]);
    setSchedulingData({
      // Ensure full reset of scheduling data for new call, populate admin from Redux
      applicantFirstName: "",
      applicantLastName: "",
      email: "",
      adminFirstName: user?.firstName || "",
      adminLastName: user?.lastName || "",
      adminEmail: user?.email || "",
      date: "",
      time: "",
      domain: "",
      customQuestions: [], // Reset to empty array
      isComplete: false,
    });
    setShowFileUpload(false); // Hide upload section on new call

    try {
      // Check microphone first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      console.log("✅ Microphone access granted");

      // Set up event listeners RIGHT BEFORE starting call
      const vapi = vapiRef.current;
      // Remove any existing listeners first
      vapi.removeAllListeners();

      // Add fresh listeners
      vapi.on("call-start", () => {
        console.log("✅ Call started - setting status to active");
        setCallStatus("active");
        setError("");
      });
      vapi.on("call-end", () => {
        console.log("❌ Call ended - setting status to ended");
        setCallStatus("ended");
        setIsSpeaking(false);
      });
      vapi.on("speech-start", () => {
        console.log("🎤 Speech started");
        setIsSpeaking(true);
      });
      vapi.on("speech-end", () => {
        console.log("🔇 Speech ended");
        setIsSpeaking(false);
      });
      vapi.on("message", (message: any) => {
        console.log("📝 Vapi Message Received:", message.type, message); // Log the full message object

        if (
          message.type === "transcript" &&
          message.transcriptType === "final" &&
          message.transcript?.trim()
        ) {
          const newMessage: TranscriptMessage = {
            role: message.role,
            text: message.transcript.trim(),
            timestamp: new Date(),
            id: `${Date.now()}-${Math.random()}`,
          };
          setMessages((prev) => [...prev, newMessage]);

          // --- START: Hybrid Extraction Logic (Fallback/Supplement from Transcript) ---
          if (purpose === "scheduling" && newMessage.role === "user") {
            setSchedulingData((prevData) => {
              const currentData = { ...prevData }; // Start with existing data
              let userText = newMessage.text.toLowerCase(); // Use let because we'll modify it

              console.log(
                "DEBUG: Attempting transcript extraction from user message:",
                userText
              );

              // 1. Try to extract full name first (e.g., "My name is John Doe", "I am Jane Smith")
              const fullNameMatch = userText.match(
                /\b(?:my name is|i am)\s+([a-zA-Z'-]+(?:\s+[a-zA-Z'-]+)*)\b/i
              );
              if (fullNameMatch) {
                const fullName = fullNameMatch[1].trim();
                const nameParts = fullName.split(/\s+/);
                if (nameParts.length > 0 && !currentData.applicantFirstName) {
                  currentData.applicantFirstName =
                    nameParts[0].charAt(0).toUpperCase() +
                    nameParts[0].slice(1);
                  console.log(
                    "DEBUG: Transcript Extracted Applicant First Name (from full name):",
                    currentData.applicantFirstName
                  );
                }
                if (nameParts.length > 1 && !currentData.applicantLastName) {
                  currentData.applicantLastName =
                    nameParts[nameParts.length - 1].charAt(0).toUpperCase() +
                    nameParts[nameParts.length - 1].slice(1);
                  console.log(
                    "DEBUG: Transcript Extracted Applicant Last Name (from full name):",
                    currentData.applicantLastName
                  );
                }
              }

              // 2. Fallback: Try to extract individual first name if not already set
              if (!currentData.applicantFirstName) {
                const firstNameMatch = userText.match(
                  /\b(?:my first name is|first name is)\s+([a-zA-Z'-]+)\b/i
                );
                if (firstNameMatch) {
                  currentData.applicantFirstName =
                    firstNameMatch[1].charAt(0).toUpperCase() +
                    firstNameMatch[1].slice(1);
                  console.log(
                    "DEBUG: Transcript Extracted Applicant First Name (individual):",
                    currentData.applicantFirstName
                  );
                }
              }

              // 3. Fallback: Try to extract individual last name if not already set
              if (!currentData.applicantLastName) {
                const lastNameMatch = userText.match(
                  /\b(?:my last name is|last name is)\s+([a-zA-Z'-]+)\b/i
                );
                if (lastNameMatch) {
                  currentData.applicantLastName =
                    lastNameMatch[1].charAt(0).toUpperCase() +
                    lastNameMatch[1].slice(1);
                  console.log(
                    "DEBUG: Transcript Extracted Applicant Last Name (individual):",
                    currentData.applicantLastName
                  );
                }
              }

              // Email extraction: Normalize verbal components then apply a single regex
              console.log(
                "EMAIL_EXTRACTION: Original user text for email parsing:",
                userText
              );

              // Normalize common verbalizations of email components
              userText = userText
                .replace(/\s*dot\s*/g, ".") // " dot " or "dot" -> "."
                .replace(/\s*at\s*(?:sign)?\s*/g, "@") // " at " or " at sign " -> "@"
                .replace(/\s*underscore\s*/g, "_") // " underscore " -> "_"
                .replace(/\s*dash\s*/g, "-") // " dash " -> "-"
                .replace(/\s*hyphen\s*/g, "-"); // " hyphen " -> "-"

              console.log(
                "EMAIL_EXTRACTION: After verbal normalization:",
                userText
              );

              // Remove any remaining spaces within what should be the email address
              // This targets sequences that look like email parts but might have spaces
              userText = userText.replace(
                /([a-zA-Z0-9._%+-]+)\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
                "$1$2"
              );
              userText = userText.replace(/([a-zA-Z0-9._%+-]+)\s+@/g, "$1@"); // e.g., "john doe @ example.com"
              userText = userText.replace(
                /@\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
                "@$1"
              ); // e.g., "john.doe @example.com"

              console.log("EMAIL_EXTRACTION: After space removal:", userText);

              // Try to extract email from the normalized and cleaned text
              const emailRegex =
                /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
              const emailMatch = userText.match(emailRegex);

              if (emailMatch && !currentData.email) {
                currentData.email = emailMatch[1];
                console.log(
                  "EMAIL_EXTRACTION: Extracted Email (Normalized):",
                  currentData.email
                );
              } else if (currentData.email) {
                console.log(
                  "EMAIL_EXTRACTION: Email already set, skipping transcript extraction."
                );
              } else {
                console.log(
                  "EMAIL_EXTRACTION: No email found in transcript after processing."
                );
              }

              // Domain extraction (transcript fallback)
              console.log(
                "DOMAIN_EXTRACTION: Original user text for domain parsing:",
                userText
              );
              const domainRegex =
                /\b(?:domain is|field is|expertise is|specialize in|focus on|work with|am a|i'm a|in the field of|for the role of)\s*([\w\s\d\-.,/]+)\b|\b(front end development| back end development | visa interviews | visa interview | admission interview | data science|machine learning|software engineering|web development|mobile development|cloud computing|cybersecurity|network administration|database management|project management|ui\/ux design|quality assurance|devops|technical support|business analysis|systems analysis|product management)\b/i;
              const domainMatch = userText.match(domainRegex);

              if (domainMatch && !currentData.domain) {
                currentData.domain = (
                  domainMatch[1] ||
                  domainMatch[2] ||
                  ""
                ).trim();
                console.log(
                  "DOMAIN_EXTRACTION: Extracted Domain:",
                  currentData.domain
                );
              } else if (currentData.domain) {
                console.log(
                  "DOMAIN_EXTRACTION: Domain already set, skipping transcript extraction."
                );
              } else {
                console.log(
                  "DOMAIN_EXTRACTION: No domain found in transcript after processing."
                );
              }

              // --- CRITICAL: Date and Time Extraction using parseDateTimeFromText ---
              // Only try to parse if the field is not already set by a previous, more reliable source (like AI function call)
              console.log(
                "DEBUG: Current date before parsing attempt:",
                currentData.date
              );
              console.log(
                "DEBUG: Current time before parsing attempt:",
                currentData.time
              );

              const { date: parsedDate, time: parsedTime } =
                parseDateTimeFromText(userText);
              if (parsedDate && !currentData.date) {
                currentData.date = parsedDate;
                console.log(
                  "DEBUG: Date updated from parseDateTimeFromText:",
                  currentData.date
                );
              }
              if (parsedTime && !currentData.time) {
                currentData.time = parsedTime;
                console.log(
                  "DEBUG: Time updated from parseDateTimeFromText:",
                  currentData.time
                );
              }
              console.log(
                "DEBUG: Date after parsing attempt:",
                currentData.date
              );
              console.log(
                "DEBUG: Time after parsing attempt:",
                currentData.time
              );

              // Custom Questions extraction (transcript fallback - append if new question detected)
              // This is a simple approach; for robust multi-question parsing, rely on AI tool call.
              const customQuestionMatch = userText.match(
                /\b(?:my custom question is|i have a custom question|add this question|question is)\s*(.+)/i
              );
              if (customQuestionMatch) {
                const newQuestion = customQuestionMatch[1].trim();
                if (
                  newQuestion &&
                  !currentData.customQuestions.includes(newQuestion)
                ) {
                  currentData.customQuestions = [
                    ...currentData.customQuestions,
                    newQuestion,
                  ];
                  console.log(
                    "DEBUG: Transcript Extracted Custom Question (appended):",
                    newQuestion
                  );
                }
              }

              // Check if all required fields are now complete
              const newIsComplete = !!(
                currentData.applicantFirstName &&
                currentData.applicantLastName &&
                currentData.email &&
                currentData.date &&
                currentData.time &&
                currentData.domain
              );
              if (newIsComplete !== currentData.isComplete) {
                console.log(
                  `DEBUG: isComplete changed from ${currentData.isComplete} to ${newIsComplete}`
                );
              }
              currentData.isComplete = newIsComplete;

              // Trigger file upload section if complete
              if (currentData.isComplete && !showFileUpload) {
                console.log(
                  "DEBUG: All scheduling data complete (via transcript parsing). Setting showFileUpload to true."
                );
                setShowFileUpload(true);
              }
              return currentData;
            });
          }
          // --- END: Hybrid Extraction Logic ---
        } else if (
          message.type === "function_call" &&
          message.functionCall?.name === "schedule_interview"
        ) {
          console.log(
            "DEBUG: Function call received from Vapi (PRIMARY SOURCE):",
            message.functionCall
          );
          const params = message.functionCall.parameters;
          if (params) {
            setSchedulingData((prevData) => {
              const extractedData: SchedulingData = {
                applicantFirstName:
                  params.applicantFirstName ||
                  prevData.applicantFirstName ||
                  "",
                applicantLastName:
                  params.applicantLastName || prevData.applicantLastName || "",
                email: params.email || prevData.email || "",
                adminFirstName: prevData.adminFirstName, // Always use value from Redux/initial state
                adminLastName: prevData.adminLastName, // Always use value from Redux/initial state
                adminEmail: prevData.adminEmail, // Always use value from Redux/initial state
                date: params.date || prevData.date || "",
                time: params.time || prevData.time || "",
                domain: params.domain || prevData.domain || "",
                customQuestions: Array.isArray(params.customQuestions) // Ensure it's an array
                  ? params.customQuestions
                  : prevData.customQuestions || [], // Fallback to existing or empty array
                isComplete: false, // Recalculate below
              };
              extractedData.isComplete = !!(
                extractedData.applicantFirstName &&
                extractedData.applicantLastName &&
                extractedData.email &&
                extractedData.date &&
                extractedData.time &&
                extractedData.domain
              );
              console.log(
                "DEBUG: Extracted Scheduling Data from Function Call (Merged):",
                extractedData
              );
              console.log(
                "DEBUG: Is Complete Status (from Function Call):",
                extractedData.isComplete
              );

              if (extractedData.isComplete && !showFileUpload) {
                console.log(
                  "DEBUG: All scheduling data complete (via function call). Setting showFileUpload to true."
                );
                setShowFileUpload(true);
              }
              return extractedData;
            });
          } else {
            console.warn(
              "DEBUG: Function call received but no parameters found."
            );
          }
        } else if (message.type === "function_call") {
          console.log(
            "DEBUG: Received a function_call for a different function:",
            message.functionCall?.name
          );
        }
      });
      vapi.on("error", (error: any) => {
        console.error("❌ VAPI Error:", error);
        setError(`VAPI Error: ${error.message || "Unknown error"}`);
        setCallStatus("ended");
      });

      // Start the call
      console.log("📞 Starting VAPI call with assistant config...");
      await vapi.start(schedulerAssistant);
      console.log("📞 VAPI call started successfully");
    } catch (error: any) {
      console.error("❌ Failed to start call:", error);
      setError(`Failed to start call: ${error.message}`);
      setCallStatus("inactive");
    }
  };

  // End call function
  const endCall = () => {
    if (
      vapiRef.current &&
      (callStatus === "active" || callStatus === "connecting")
    ) {
      console.log("🛑 Ending call...");
      try {
        vapiRef.current.stop();
        setCallStatus("ended");
        setIsSpeaking(false);
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
  };

  // Reset to start new call
  const resetCall = () => {
    setCallStatus("inactive");
    setMessages([]);
    setIsSpeaking(false);
    setError("");
    setSchedulingData({
      // Ensure full reset for a fresh start, populate admin from Redux
      applicantFirstName: "",
      applicantLastName: "",
      email: "",
      adminFirstName: user?.firstName || "",
      adminLastName: user?.lastName || "",
      adminEmail: user?.email || "",
      date: "",
      time: "",
      domain: "",
      customQuestions: [], // Reset to empty array
      isComplete: false,
    });
    setShowFileUpload(false);
    setSelectedFile(null);
    setScheduleError("");
    setScheduleSuccess("");
  };

  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size must be less than 5MB");
      setSelectedFile(null);
      return;
    }
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
    const fileInput = document.getElementById("ai-resume") as HTMLInputElement;
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

  // Process AI scheduling
  const processAIScheduling = async () => {
    if (!selectedFile) {
      setScheduleError("Please upload a resume");
      return;
    }
    if (!schedulingData.isComplete) {
      setScheduleError(
        "Please complete the conversation with all required details"
      );
      return;
    }

    setIsProcessing(true);
    setScheduleError("");
    setScheduleSuccess("");

    try {
      setProcessingStep("Uploading resume...");
      const resumeResponse = await uploadResume(selectedFile);
      console.log("✅ Resume uploaded:", resumeResponse);
      const { text, ...cleanedResumeData } = resumeResponse;
      const payload = { text };

      setProcessingStep("Generating AI questions...");
      const questionsResponse = await generateResumeQuestions(payload);
      console.log("✅ AI questions generated:", questionsResponse);

      const domainQuestionsResponse = await generateDomainQuestions({
        domain: schedulingData.domain,
      });

      const resumeQuestions = questionsResponse.questions?.slice(0, 3) || [];
      const domainQuestions =
        domainQuestionsResponse.questions?.slice(0, 2) || [];

      const combinedQuestions = [...resumeQuestions, ...domainQuestions];

      setProcessingStep("Scheduling interview...");
      const scheduleData = {
        adminFirstName: user?.firstName || "", // Use user from Redux
        adminLastName: user?.lastName || "", // Use user from Redux
        adminEmail: user?.email || "", // Use user from Redux
        applicantFirstName: schedulingData.applicantFirstName,
        applicantLastName: schedulingData.applicantLastName,
        applicantEmail: schedulingData.email,
        date: schedulingData.date,
        time: schedulingData.time,
        interviewDomain: schedulingData.domain,
        scheduleType: "ai",
        customQuestions: schedulingData.customQuestions, // Pass custom questions as array
        aiGeneratedQuestions: combinedQuestions,
      };
      const scheduleResponse = await scheduleInterview(scheduleData);
      console.log("✅ Interview scheduled:", scheduleResponse);
      const updatedInterviewSchema = await updateUserInterviewSchema({
        email: user?.email || "",
        interviewId: scheduleResponse._id.toString(),
      });
      await updateUserInterviewSchema({
        email: schedulingData?.email,
        interviewId: scheduleResponse._id.toString(),
      });
      console.log("Interview schema updated:", updatedInterviewSchema);
      setScheduleSuccess(
        "🎉 Interview scheduled successfully! Resume uploaded and AI questions generated."
      );

      if (onScheduleComplete) {
        onScheduleComplete({
          ...scheduleResponse,
          schedulingData,
          questionsResponse,
        });
      }

      setTimeout(() => {
        resetCall();
      }, 3000);
    } catch (error: any) {
      console.error("❌ Error in AI interview scheduling process:", error);
      setScheduleError(
        error.message || "Failed to schedule interview. Please try again."
      );
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const downloadTranscript = () => {
    if (messages.length === 0) return;
    const content = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toLocaleTimeString()}] ${msg.role.toUpperCase()}: ${
            msg.text
          }`
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-transcript-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Three dots loader
  const ThreeDotsLoader = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
      <div
        className="w-1 h-1 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "0.1s" }}
      />
      <div
        className="w-1 h-1 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  );

  // Show error if critical
  if (error && error.includes("API key")) {
    return (
      <div
        className={isEmbedded ? "inline-block" : "fixed bottom-6 right-6 z-50"}
      >
        <Alert variant="destructive" className="max-w-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Embedded mode
  if (isEmbedded) {
    return (
      <div className="inline-block">
        {callStatus === "inactive" ? (
          <Button
            onClick={startCall}
            size="lg"
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full cursor-pointer"
            disabled={callStatus !== "inactive"}
          >
            {callStatus !== "inactive" ? (
              <>
                <ThreeDotsLoader className="mr-3" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-3" />
                Start Interview Scheduling
              </>
            )}
          </Button>
        ) : callStatus === "ended" ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Call ended</p>
            <Button
              onClick={resetCall}
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full cursor-pointer"
            >
              <Mic className="w-5 h-5 mr-3" />
              Start New Call
            </Button>
          </div>
        ) : (
          <Card className="w-96 shadow-2xl border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isSpeaking
                      ? "bg-red-500 animate-pulse"
                      : callStatus === "active"
                      ? "bg-green-500 animate-pulse"
                      : "bg-yellow-500 animate-pulse"
                  }`}
                />
                <div>
                  <CardTitle className="text-sm">Interview Scheduler</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {callStatus === "connecting"
                      ? "Connecting..."
                      : isSpeaking
                      ? "AI Speaking..."
                      : "Listening..."}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 p-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={endCall}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Debug Info */}
              <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                <strong>Status:</strong> {callStatus} |{" "}
                <strong>Messages:</strong> {messages.length} |{" "}
                <strong>Speaking:</strong> {isSpeaking ? "Yes" : "No"}
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Scheduling Data Preview */}
              {purpose === "scheduling" && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Collected Information
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                    <div>
                      <strong>Applicant:</strong>{" "}
                      {schedulingData.applicantFirstName || "N/A"}{" "}
                      {schedulingData.applicantLastName || ""}
                    </div>
                    <div>
                      <strong>Applicant Email:</strong>{" "}
                      {schedulingData.email || "N/A"}
                    </div>
                    {/* Admin fields will now always show values from Redux user, or N/A if user is not logged in */}
                    <div>
                      <strong>Admin:</strong>{" "}
                      {schedulingData.adminFirstName || "N/A"}{" "}
                      {schedulingData.adminLastName || ""}
                    </div>
                    <div>
                      <strong>Admin Email:</strong>{" "}
                      {schedulingData.adminEmail || "N/A"}
                    </div>
                    <div>
                      <strong>Date:</strong>{" "}
                      {formatDateForDisplay(schedulingData.date) || "N/A"}
                    </div>
                    <div>
                      <strong>Time:</strong>{" "}
                      {formatTimeForDisplay(schedulingData.time) || "N/A"}
                    </div>
                    <div>
                      <strong>Domain:</strong> {schedulingData.domain || "N/A"}
                    </div>
                    {schedulingData.customQuestions.length > 0 && (
                      <div>
                        <strong>Custom Questions:</strong>{" "}
                        <span className="block whitespace-pre-wrap">
                          {schedulingData.customQuestions.join("\n")}
                        </span>
                      </div>
                    )}
                  </div>
                  {schedulingData.isComplete && (
                    <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                      ✅ Ready for Resume Upload
                    </Badge>
                  )}
                </div>
              )}

              {/* File Upload Section - This is what should appear! */}
              {showFileUpload && purpose === "scheduling" && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
                  <Label
                    htmlFor="ai-resume"
                    className="text-sm font-medium mb-2 block"
                  >
                    Upload Resume to Complete Scheduling
                  </Label>
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-2">
                        PDF, DOC, or DOCX (Max 5MB)
                      </p>
                      <Input
                        id="ai-resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isProcessing}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("ai-resume")?.click()
                        }
                        disabled={isProcessing}
                      >
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-3 bg-muted/50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs font-medium">
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
                        className="h-6 w-6 p-0"
                        disabled={isProcessing}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  {fileError && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {fileError}
                      </AlertDescription>
                    </Alert>
                  )}
                  {scheduleError && (
                    <Alert className="mt-2" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {scheduleError}
                      </AlertDescription>
                    </Alert>
                  )}
                  {scheduleSuccess && (
                    <Alert className="mt-2 border-green-200 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                        {scheduleSuccess}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={processAIScheduling}
                    size="sm"
                    className="w-full mt-3"
                    disabled={
                      !selectedFile ||
                      !schedulingData.isComplete ||
                      isProcessing
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        {processingStep || "Processing..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Complete Scheduling
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Transcript Area */}
              <ScrollArea className="h-48 w-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.role === "user"
                              ? "text-blue-100"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isSpeaking && (
                    <div className="flex justify-center">
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                        <ThreeDotsLoader />
                        <span>AI is speaking...</span>
                      </div>
                    </div>
                  )}
                  {messages.length === 0 &&
                    callStatus === "active" &&
                    !isSpeaking && (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-muted-foreground text-center">
                          Start speaking to begin the interview scheduling
                          process...
                        </p>
                      </div>
                    )}
                </div>
              </ScrollArea>

              {messages.length > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTranscript}
                    className="flex-1 bg-transparent"
                    disabled={messages.length === 0}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetCall}
                    className="flex-1 bg-transparent"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Floating widget (non-embedded)
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {callStatus === "inactive" ? (
        <Button
          onClick={startCall}
          size="lg"
          className="h-14 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
          disabled={callStatus !== "inactive"}
        >
          <>
            <Mic className="w-5 h-5 mr-2" />
            Schedule Interview
          </>
        </Button>
      ) : callStatus === "ended" ? (
        <Button
          onClick={resetCall}
          size="lg"
          className="h-14 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
        >
          <Mic className="w-5 h-5 mr-2" />
          Start New Call
        </Button>
      ) : (
        <Card className="w-80 shadow-2xl border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isSpeaking
                      ? "bg-red-500 animate-pulse"
                      : callStatus === "active"
                      ? "bg-green-500 animate-pulse"
                      : "bg-yellow-500 animate-pulse"
                  }`}
                />
              </div>
              <div>
                <CardTitle className="text-sm">Interview Scheduler</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {callStatus === "connecting"
                    ? "Connecting..."
                    : isSpeaking
                    ? "AI Speaking..."
                    : "Listening..."}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={endCall}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-48 w-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.role === "user"
                            ? "text-blue-100"
                            : "text-muted-foreground"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isSpeaking && (
                  <div className="flex justify-center">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                      <ThreeDotsLoader />
                      <span>AI is speaking...</span>
                    </div>
                  </div>
                )}
                {messages.length === 0 &&
                  callStatus === "active" &&
                  !isSpeaking && (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-sm text-muted-foreground text-center">
                        Start speaking to begin scheduling...
                      </p>
                    </div>
                  )}
              </div>
            </ScrollArea>
            {messages.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTranscript}
                  className="flex-1 bg-transparent"
                  disabled={messages.length === 0}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCall}
                  className="flex-1 bg-transparent"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VapiWidget;
