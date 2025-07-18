const BASE_URL = "http://localhost:8080";

export const endpoints = {
  SIGNUP_API: BASE_URL + "/auth/register",
  LOGIN_API: BASE_URL + "/auth/login",
  WELCOME_CHATBOT_API: BASE_URL + "/chatbot/welcome",
  GET_CHATBOT_RESPONSE_API: BASE_URL + "/chatbot/chat",
  INTERVIEW_SCHEDULE_API: BASE_URL + "/interview-schedule",
  RESUME_PARSE_API: BASE_URL + "/resume/parse",
  RESUME_QUESTIONS_API: BASE_URL + "/resume/questions",
  DOMAIN_QUESTIONS_API: BASE_URL + "/generate-questions",
  GET_USER_INTERVIEWS_API: BASE_URL + "/users/getUserInterviews/",
  UPDATE_INTERVIEW_API: BASE_URL + "/users/add-interview",
  UPDATE_INTERVIEW_STATUS: BASE_URL + "/interview-schedule/",
};
