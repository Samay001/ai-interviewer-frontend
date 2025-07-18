import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface BaseComponent {
  className?: string;
  children?: ReactNode;
}

export interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export interface ButtonProps extends BaseComponent {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export interface CardProps extends BaseComponent {
  hover?: boolean;
  gradient?: boolean;
}
