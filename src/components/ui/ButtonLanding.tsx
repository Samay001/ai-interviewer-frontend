import React from "react";
import { ButtonProps } from "@/types";
import { cn } from "@/utils/cn";

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled = false,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 focus:ring-purple-500",
    secondary:
      "border border-white/30 backdrop-blur-sm text-white hover:bg-white/10 focus:ring-white/50",
    outline:
      "border-2 border-white/30 text-white hover:bg-white/10 focus:ring-white/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-full",
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
