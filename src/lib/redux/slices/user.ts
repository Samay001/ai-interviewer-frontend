import { createSlice } from "@reduxjs/toolkit";

const initialState = { 
  token: "", 
  user: {},
  interviewCompletionStatus:false,
  hrInterviewScheduleStatus:false,
  currentInterviewId:null,
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    addToken: (state, action) => {
      state.token = action.payload;
    },
    addUser: (state, action) => {
      state.user = action.payload;
    },
    // New logout action
    logout: (state) => {
      state.token = "";
      state.user = {};
    },
    setUserInterviewCompletionStatus: (state,action)=>{
      console.log("incoming",action.payload)
      state.interviewCompletionStatus=action.payload;
    },
    setHrInterviewScheduleStatus:(state,action) =>{
      state.hrInterviewScheduleStatus=action.payload;
    },
    setCurrentInterviewId:(state,action)=>{
      state.currentInterviewId =action.payload;
    }
  },
});

export const { addToken, addUser, logout ,setUserInterviewCompletionStatus ,setHrInterviewScheduleStatus , setCurrentInterviewId } = userSlice.actions;
export default userSlice.reducer;
