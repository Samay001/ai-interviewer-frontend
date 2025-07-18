import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

/**
 * Builds a Vapi-compatible assistant config based on applicant data.
 * @param {object} applicant - currentApplicant from Redux
 * @returns {CreateAssistantDTO}
 */
export const createInterviewer = (applicant): CreateAssistantDTO => {
  const adminName = applicant.adminName || "Admin";
  const studentName = applicant.studentName || "Candidate";
  const domain = applicant.domain || "general domain";
  const customQuestions = applicant.customQuestions || [];
  const aiGeneratedQuestions = applicant.aiGeneratedQuestions || [];

  const allQuestions = [...aiGeneratedQuestions, ...customQuestions].join('\n');

  return {
    name: "AI Interviewer",
    firstMessage: `Hello ${studentName}! Thank you for joining me today. I’m conducting this interview on behalf of ${adminName}. Based on your resume, I can see you have a solid background in ${domain}. Before we get started, could you please introduce yourself briefly?`,
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
    startSpeakingPlan: {
      waitSeconds: 2,
      smartEndpointingPlan: {
        provider: "livekit",
        waitFunction: "700 + 4000 * max(0, x-0.5)" 
      }
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional job interviewer conducting a real-time voice interview with ${studentName}. 

**Goals:**
- Greet them warmly and introduce yourself on behalf of ${adminName}.
- Mention their domain expertise: ${domain}.
- Ask them to introduce themselves at the start.
- Then proceed with this structured question flow:
${allQuestions}

**During the interview:**
- Listen actively and acknowledge responses.
- Ask short, clear follow-up or cross-questions if needed.
- Be official yet warm and conversational — no robotic phrasing.
- If asked about the company or role, answer briefly or direct them to HR.

**Closing:**
- Thank them genuinely for their time.
- Let them know someone will follow up soon.
- End the conversation positively and professionally.

Keep all voice responses short and natural — avoid long paragraphs. Be clear, professional, and human-like.`
        },
      ],
    },
  };
};
