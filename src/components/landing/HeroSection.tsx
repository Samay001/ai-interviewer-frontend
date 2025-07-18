"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight, Zap, Play, Star } from "lucide-react";
import { AnimatedBackground, GradientText } from "@/components/common";
import { Button } from "@/components/ui";
import { HERO_CONTENT } from "@/constants/landing";
import Link from "next/link";

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBackground />

      <div
        className={`relative z-10 text-center px-6 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
            {HERO_CONTENT.badge}
          </span>
        </div>

        {/* Main Title */}
        <GradientText
          as="h1"
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          {HERO_CONTENT.title}
          <br />
          <span className="text-4xl md:text-6xl">{HERO_CONTENT.subtitle}</span>
        </GradientText>

        {/* Description */}
        <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
          {HERO_CONTENT.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/login">
            <Button
              variant="primary"
              size="lg"
              className="group cursor-pointer"
            >
              <span className="relative z-10 flex items-center">
                {HERO_CONTENT.primaryCTA}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            className="group cursor-pointer"
          >
            <Play className="w-5 h-5 mr-2" />
            {HERO_CONTENT.secondaryCTA}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/60">
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 border-2 border-slate-900"
                ></div>
              ))}
            </div>
            <span>{HERO_CONTENT.trustBadge}</span>
          </div>
          <div className="flex items-center">
            <div className="flex mr-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span>{HERO_CONTENT.rating}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
