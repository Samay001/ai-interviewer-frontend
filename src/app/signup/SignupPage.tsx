"use client";
import React from "react";
import SignupForm from "@/components/signup/SignupForm";
import BrandSection from "@/components/signup/BrandSection";

const SignupPage = () => {
  return (
    <div className="min-h-screen flex">
      <SignupForm />
      <BrandSection />
    </div>
  );
};

export default SignupPage;
