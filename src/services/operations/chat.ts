"use server";
import { endpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const { WELCOME_CHATBOT_API , GET_CHATBOT_RESPONSE_API } = endpoints;

export const chatbotSetup = async (): Promise<string> => {
  try {
    const response = await apiConnector({
        method: "GET",
        url: WELCOME_CHATBOT_API,
    })

    if (response.statusText!=='OK') {
      throw new Error(response.data.message);
    }

    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("WELCOME CHATBOT API ERROR", error);
    throw new Error(error?.message || "chatbot setup failed");
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getChatbotResponse = async ({ message }: {message:string}): Promise<any> => {
  try {
    const response = await apiConnector({
        method:"POST",
        url:GET_CHATBOT_RESPONSE_API,
        data:{ message }
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    console.log("response",response.data.response)
    return response.data.response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("CHATBOT RESPONSE API ERROR", error);
    throw new Error(error?.message || "chatbot response failed");
  }
};
