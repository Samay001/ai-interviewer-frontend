"use client";
import React from "react";

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[20%] left-[15%] w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute top-[60%] right-[20%] w-10 h-10 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-[25%] left-[10%] w-20 h-20 bg-white/10 rounded-full animate-pulse delay-2000"></div>
      <div className="absolute top-[40%] right-[10%] w-6 h-6 bg-white/20 rounded-full animate-bounce delay-500"></div>
      <div className="absolute bottom-[40%] right-[30%] w-8 h-8 bg-white/20 rounded-full animate-bounce delay-1500"></div>
    </div>
  )
}

export default FloatingElements;
