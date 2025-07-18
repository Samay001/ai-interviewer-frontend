"use client";
import React from "react";
import { BaseComponent } from "@/types";
import { cn } from "@/utils/cn";

interface GradientTextProps extends BaseComponent {
  gradient?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  gradient = "from-white via-purple-100 to-blue-100",
  as: Component = "span",
  ...props
}) => {
  return (
    <Component
      className={cn(
        `bg-gradient-to-r ${gradient} bg-clip-text text-transparent`,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default GradientText;
