"use client";
import React from "react";

const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[15%] right-[15%] w-24 h-24 bg-white/10 rounded-2xl animate-pulse"></div>
      <div className="absolute top-[70%] right-[25%] w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-[20%] right-[10%] w-20 h-20 bg-white/10 rounded-xl animate-pulse delay-2000"></div>
      <div className="absolute top-[40%] right-[5%] w-8 h-8 bg-white/20 rounded-full animate-bounce delay-500"></div>
      <div className="absolute bottom-[50%] right-[30%] w-12 h-12 bg-white/20 rounded-lg animate-bounce delay-1500"></div>
    </div>
  );
};

export default FloatingShapes;
