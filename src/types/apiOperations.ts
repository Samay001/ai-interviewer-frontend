export interface signupType{
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: string,
    phoneNumber: string
}

export interface loginType{
    email:string,
    password:string
}

export interface interviewType{
    _id:string,
    adminFirstName:string,
    adminLastName:string,
    adminEmail:string,
    applicantFirstName:string,
    applicantLastName:string,
    applicantEmail:string,
    date:string,
    time:string,
    interviewDomain:string,
    customQuestions:string[],
    aiGeneratedQuestions:string[],
    interviewTranscript:string,
    score:number,
    scheduleType:string,
    interviewStatus:string,
    interviewResult:string,
    createdAt:Date,
    updatedAt:Date
}