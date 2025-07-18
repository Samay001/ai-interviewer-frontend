import React from "react";
import AIInterviewerLanding from "@/app/landing/AIInterviewerLanding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Interviewer Platform - Transform Your Hiring Process",
  description:
    "Revolutionary AI-powered interviews that adapt, analyze, and deliver insights. Eliminate bias, improve candidate experience, and make better hiring decisions.",
  keywords:
    "AI interviewer, hiring platform, recruitment technology, bias-free hiring, interview automation",
  authors: [{ name: "AI Interviewer Team" }],
  openGraph: {
    title: "AI Interviewer Platform - Transform Your Hiring Process",
    description:
      "Revolutionary AI-powered interviews that adapt, analyze, and deliver insights.",
    url: "https://your-domain.com",
    siteName: "AI Interviewer Platform",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Interviewer Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Interviewer Platform - Transform Your Hiring Process",
    description:
      "Revolutionary AI-powered interviews that adapt, analyze, and deliver insights.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function HomePage(): React.JSX.Element {
  return <AIInterviewerLanding />;
}
