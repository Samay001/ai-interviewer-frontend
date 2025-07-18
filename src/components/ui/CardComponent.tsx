import React from "react";
import { CardProps } from "@/types";
import { cn } from "@/utils/cn";

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  gradient = false,
  ...props
}) => {
  const baseStyles =
    "relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-500";
  const hoverStyles = hover
    ? "hover:bg-white/10 hover:scale-105 hover:shadow-2xl group"
    : "";
  const gradientStyles = gradient
    ? "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-purple-500/20 before:to-blue-500/20 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100 before:-z-10"
    : "";

  return (
    <div
      className={cn(baseStyles, hoverStyles, gradientStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
