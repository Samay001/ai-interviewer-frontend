"use server";
import { interviewType, loginType, signupType } from "@/types/apiOperations";
import { endpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { Interview } from "@/types";

const { SIGNUP_API, LOGIN_API, GET_USER_INTERVIEWS_API } = endpoints;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signup = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  phoneNumber,
}: signupType): Promise<any> => {
  try {
    const response = await apiConnector({
      method: "POST",
      url: SIGNUP_API,
      data: { firstName, lastName, email, password, phoneNumber, role },
    });

    if (response.status !== 201) {
      throw new Error(response.data.message);
    }
    // Return something useful, e.g., user data or a success message
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("SIGN UP API ERROR", error);
    throw new Error(error?.message || "Signup failed");
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const login = async ({ email, password }: loginType): Promise<any> => {
  try {
    const response = await apiConnector({
      method: "POST",
      url: LOGIN_API,
      data: { email, password },
    });

    // console.log("response", response);
    if (response.status !== 201) {
      throw new Error(response.data.message);
    }
    // console.log("response", response.data);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("LOG IN API ERROR", error);
    throw new Error(error?.message || "Login failed");
  }
};

export const getInterviews = async ({
  id,
}: {
  id: string;
}): Promise<Interview[]> => {
  try {
    // console.log("GET INTERVIEWS API ID", id);
    const response = await apiConnector({
      method: "GET",
      url: GET_USER_INTERVIEWS_API + id,
    });
    // console.log("response", response);

    const formattedData = response.data.map((item: interviewType) => ({
      id: item._id,
      studentName: item.applicantFirstName + " " + item.applicantLastName,
      email: item.applicantEmail,
      date: item.date,
      time: item.time,
      domain: item.interviewDomain,
      type: item.scheduleType,
      status: item.interviewStatus,
      score: item.score, // Map the score
      adminName: item.adminFirstName + " " + item.adminLastName, // Map admin name
      interviewTranscript: item.interviewTranscript, // Map transcript
      interviewResult: item.interviewResult, // Map result
      createdAt: item.createdAt, // Map createdAt
      customQuestions: item.customQuestions, // Map custom questions
      aiGeneratedQuestions: item.aiGeneratedQuestions,
    }));
    // console.log("GET INTERVIEWS API RESPONSE", formattedData);

    return formattedData;
  } catch (error) {
    console.error("GET INTERVIEWS API ERROR", error);
    return [];
  }
};
