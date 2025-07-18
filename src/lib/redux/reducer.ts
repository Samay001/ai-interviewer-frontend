import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/user"
import chatReducer from "./slices/chat"
import appilcantReducer from "./slices/applicant"

const reducer = combineReducers({
    user:userReducer,
    chat:chatReducer,
    applicant:appilcantReducer
})

export default reducer