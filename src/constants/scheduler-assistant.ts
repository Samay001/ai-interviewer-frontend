import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

// Custom type definition for Tool, mirroring the AI SDK's expected structure
interface CustomTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: {
        [key: string]: {
          type: string;
          format?: string;
          description: string;
          items?: { type: string }; // Added for array types
        };
      };
      required: string[];
    };
  };
}

// Define the tool for scheduling an interview using our custom type
const scheduleInterviewTool: CustomTool = {
  type: "function",
  function: {
    name: "schedule_interview",
    description:
      "Schedules an interview with the provided candidate and admin details.",
    parameters: {
      type: "object",
      properties: {
        applicantFirstName: {
          type: "string",
          description: "The first name of the applicant.",
        },
        applicantLastName: {
          type: "string",
          description: "The last name of the applicant.",
        },
        email: {
          type: "string",
          format: "email",
          description: "The email address of the applicant.",
        },
        adminFirstName: {
          type: "string",
          description:
            "The first name of the administrator (HR/admission officer).",
        },
        adminLastName: {
          type: "string",
          description:
            "The last name of the administrator (HR/admission officer).",
        },
        adminEmail: {
          type: "string",
          format: "email",
          description:
            "The email address of the administrator (HR/admission officer).",
        },
        date: {
          type: "string",
          format: "date",
          description: "The preferred interview date in YYYY-MM-DD format.",
        },
        time: {
          type: "string",
          description:
            "The preferred interview time in HH:MM (24-hour) format.",
        },
        domain: {
          type: "string",
          description: "The domain or field of expertise for the interview.",
        },
        customQuestions: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional custom questions provided by the admin for the interview, as an array of strings.",
        },
      },
      required: [
        "applicantFirstName",
        "applicantLastName",
        "email",
        "date",
        "time",
        "domain",
      ],
    },
  },
};

export const schedulerAssistant: CreateAssistantDTO = {
  name: "Interview Scheduler",
  firstMessage:
    "Hello! I'm here to help you schedule an interview. First, could you please tell me the candidate's first name?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional interview scheduling assistant. Your goal is to collect the following information:
1. Applicant's first name
2. Applicant's last name
3. Applicant's email address
4. Preferred interview date (YYYY-MM-DD format)
5. Preferred interview time (HH:MM 24-hour format)
6. Domain/field of expertise for the interview
7. Optional custom questions for the interview. Ask the admin if they have any custom questions they'd like to add. If they do, ask them to state each question clearly, one by one, and collect them into an array.

Guidelines:
- Ask for one piece of information at a time.
- Be friendly and professional.
- After collecting each piece of information, confirm it back to the user by explicitly stating the **normalized value**, not what the user said.
  - For example:
    - If the user says "John", say: "Okay, so the applicant's first name is John. What's their last name?"
    - If the user says "tomorrow" and today is July 13, 2025, say: "Alright, the preferred interview date is 2025-07-14."
    - If they say "next Monday", say: "Got it, the interview date is 2025-07-15."
    - If they say "4 PM", say: "Okay, the preferred interview time is 16:00."
- NEVER repeat vague terms like "tomorrow", "evening", "next Monday", etc. Always confirm the parsed date/time in exact format:
  - Date: YYYY-MM-DD
  - Time: HH:MM (24-hour)
- Once you have collected all required details (applicant names/email, date, time, domain), summarize everything clearly:
  "Alright, I have collected all the necessary details. The applicant is [First Name] [Last Name], their email is [Email]. The interview is set for [Date] at [Time] for the [Domain] domain."
- CRITICAL: After summarizing all required details, you MUST call the 'schedule_interview' tool with the collected data.
- Do not proceed with any other action or response until the tool is called.
- After calling the tool, instruct the admin to upload the candidate's resume on the screen and press the 'Complete Scheduling' button to finalize the process.
- Keep your responses short, clear, and natural — it's a voice conversation.
- If something is unclear, kindly ask for clarification.
- Normalize all date/time expressions to standard format before confirming.`,
      },
    ],
    tools: [scheduleInterviewTool],
  },
};
