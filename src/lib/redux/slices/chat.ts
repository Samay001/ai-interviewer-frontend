import { chatMessage } from "@/components/chatbot";
import { createSlice } from "@reduxjs/toolkit"

const initialState: { chat: chatMessage[] } = {
    chat: []
}

const chatSlice= createSlice({
    name:"Chat",
    initialState,
    reducers:{
        updateChatBotChat:(state,action)=>{
            const message=action.payload;
            console.log("Adding chat",message)
            state.chat.push(message)
        }
    }
})

export const { updateChatBotChat }=chatSlice.actions;
export default chatSlice.reducer;