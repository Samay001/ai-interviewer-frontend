"use server";
import { endpoints } from "../apis";
import { apiConnector } from "../apiConnector";
const {
  INTERVIEW_SCHEDULE_API,
  RESUME_PARSE_API,
  RESUME_QUESTIONS_API,
  UPDATE_INTERVIEW_API,
  UPDATE_INTERVIEW_STATUS,
  DOMAIN_QUESTIONS_API,
} = endpoints;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const scheduleInterview = async (interviewData: {
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  date: string;
  time: string;
  interviewDomain: string;
  scheduleType: string;
  customQuestions?: Array<string>; // Updated to Array<string>
  aiGeneratedQuestions?: Array<string>;
}): Promise<any> => {
  try {
    const response = await apiConnector({
      method: "POST",
      url: INTERVIEW_SCHEDULE_API,
      data: interviewData,
    });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("INTERVIEW SCHEDULE API ERROR", error);
    throw new Error(error?.message || "Interview scheduling failed");
  }
};

export const updateUserInterviewSchema = async (interviewData: {
  email: string;
  interviewId: string;
}): Promise<any> => {
  try {
    const response = await apiConnector({
      method: "PUT",
      url: UPDATE_INTERVIEW_API,
      data: interviewData,
    });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("INTERVIEW SCHEDULE API ERROR", error);
    throw new Error(error?.message || "Interview scheduling failed");
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadResume = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiConnector({
      method: "POST",
      url: RESUME_PARSE_API,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("RESUME UPLOAD API ERROR", error);
    throw new Error(error?.message || "Resume upload failed");
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateResumeQuestions = async (
  resumeData: any
): Promise<any> => {
  try {
    const response = await apiConnector({
      method: "POST",
      url: RESUME_QUESTIONS_API,
      data: resumeData,
    });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("RESUME QUESTIONS API ERROR", error);
    throw new Error(error?.message || "Resume questions generation failed");
  }
};

export const generateDomainQuestions = async (
  domainData: any
): Promise<any> => {
  try {
    const response = await apiConnector({
      method: "POST",
      url: DOMAIN_QUESTIONS_API,
      data: domainData,
    });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("RESUME QUESTIONS API ERROR", error);
    throw new Error(error?.message || "Resume questions generation failed");
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateInterviewStatus = async ({
  interviewId,
  score,
  interviewStatus,
}: {
  interviewId: string;
  score: number;
  interviewStatus: string;
}): Promise<any> => {
  try {
    console.log("here");
    console.log({
      interviewId,
      score,
      interviewStatus,
    });

    const url = UPDATE_INTERVIEW_STATUS + interviewId + "/score-status";
    console.log("url", url);
    const response = await apiConnector({
      method: "PATCH",
      url: UPDATE_INTERVIEW_STATUS + interviewId + "/score-status",
      data: {
        score: score,
        interviewStatus: interviewStatus,
      },
    });

    console.log("response", response);
    if (response.status !== 201) {
      throw new Error(response.data.message);
    }
    console.log("UPDATE_INTERVIEW_STATUS_RESPONSE", response.data);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("UPDATE_INTERVIEW_STATUS API ERROR", error);
    throw new Error(error?.message || "Login failed");
  }
};
