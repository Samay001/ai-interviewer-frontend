"use client";
import React from "react";
import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  TestimonialsSection,
  CTASection,
} from "@/components/landing";
import Chatbot from "@/components/chatbot";

const AIInterviewerLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <Chatbot/>
    </div>
  );
};

export default AIInterviewerLanding;
