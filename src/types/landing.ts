import { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export interface Statistic {
  number: string;
  label: string;
  icon: LucideIcon;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: string;
  secondaryCTA: string;
}

export interface FeaturesSectionProps {
  title: string;
  subtitle: string;
  features: Feature[];
}

export interface StatsSectionProps {
  stats: Statistic[];
}

export interface TestimonialsSectionProps {
  title: string;
  testimonials: Testimonial[];
}

export interface CTASectionProps {
  title: string;
  description: string;
  primaryCTA: string;
  secondaryCTA: string;
  disclaimer: string;
}
