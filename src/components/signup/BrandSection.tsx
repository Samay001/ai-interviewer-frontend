"use client";
import { Rocket, TrendingUp, Clock, Star, Users } from "lucide-react";
import FloatingShapes from "./FloatingShapes";
import { ThemeToggle } from "@/components/theme-toggle";

const BrandSection = () => {
  const stats = [
    { icon: TrendingUp, number: "95%", label: "Better Hiring Accuracy" },
    { icon: Clock, number: "60%", label: "Time Saved" },
    { icon: Star, number: "4.9/5", label: "User Satisfaction" },
    { icon: Users, number: "24/7", label: "AI Support" },
  ];

  return (
    <div className="relative flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-[40vh] lg:min-h-screen">
      <FloatingShapes />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(255,255,255,0.08)' strokeWidth='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-lg text-center text-white">
        {/* Logo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30">
          <Rocket
            className="w-10 h-10 sm:w-12 sm:h-12 text-white"
            aria-hidden="true"
          />
        </div>

        {/* Main Content */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          Join 1000+ Companies
        </h1>
        <p className="text-lg sm:text-xl opacity-90 mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
          Transform your hiring process with AI-powered interviews that deliver
          results.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20"
              >
                <div className="flex flex-col items-center text-center">
                  <Icon
                    className="w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 text-white/90"
                    aria-hidden="true"
                  />
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90 leading-snug">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrandSection;
