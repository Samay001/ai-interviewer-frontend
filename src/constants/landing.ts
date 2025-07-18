import { Brain, Shield, Zap, CheckCircle, Users } from "lucide-react";
import { Feature, Statistic, Testimonial, NavItem } from "@/types";

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Stats", href: "#stats" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const HERO_CONTENT = {
  title: "Interview Smarter",
  subtitle: "Hire Better",
  description:
    "Transform your hiring process with AI-driven interviews that adapt, analyze, and deliver insights like never before.",
  primaryCTA: "Try Now",
  secondaryCTA: "Watch Demo",
  badge: "AI-Powered Interview Revolution",
  trustBadge: "1000+ companies trust us",
  rating: "4.9/5 satisfaction",
};

export const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "Adaptive AI Intelligence",
    description:
      "Our AI adapts to each candidate's responses, creating personalized interview experiences that reveal true potential.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Bias-Free Assessment",
    description:
      "Eliminate unconscious bias with objective, data-driven evaluations that focus purely on merit and capability.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Real-Time Analytics",
    description:
      "Get instant insights with comprehensive analytics that help you make informed hiring decisions faster.",
    gradient: "from-green-500 to-emerald-500",
  },
];

export const STATISTICS: Statistic[] = [
  {
    number: "95%",
    label: "Accuracy Rate",
    icon: CheckCircle,
  },
  {
    number: "10x",
    label: "Faster Hiring",
    icon: Zap,
  },
  {
    number: "500K+",
    label: "Interviews Conducted",
    icon: Users,
  },
  {
    number: "99.9%",
    label: "Uptime Guarantee",
    icon: Shield,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "This AI interviewer completely transformed our hiring process. We're making better decisions faster than ever before.",
    author: "Sarah Chen",
    role: "Head of Talent, TechCorp",
    avatar: "SC",
  },
  {
    quote:
      "The insights we get from each interview are incredible. It's like having a hiring expert analyze every conversation.",
    author: "Michael Rodriguez",
    role: "CEO, StartupXYZ",
    avatar: "MR",
  },
  {
    quote:
      "Finally, a solution that eliminates bias while improving candidate experience. Our diversity metrics have never been better.",
    author: "Emily Thompson",
    role: "CHRO, Global Enterprises",
    avatar: "ET",
  },
];

export const CTA_CONTENT = {
  title: "Ready to Transform Your Hiring?",
  description:
    "Join thousands of companies already using AI to build better teams",
  primaryCTA: "Get Started Now",
  secondaryCTA: "Schedule Demo",
  disclaimer: "No credit card required • 14-day free trial • Setup in minutes",
};

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "API", href: "#api" },
    { label: "Integrations", href: "#integrations" },
  ],
  company: [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" },
  ],
  support: [
    { label: "Help Center", href: "#helpcenter" },
    { label: "Documentation", href: "#documentation" },
    { label: "Privacy Policy", href: "#privacypolicy" },
    { label: "Terms of Service", href: "#terms" },
  ],
};
