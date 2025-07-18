"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { CTA_CONTENT } from "@/constants/landing";
import Link from "next/link";

const CTASection: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-24 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900"
    >
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {CTA_CONTENT.title}
        </h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          {CTA_CONTENT.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/signup">
            <Button
              variant="primary"
              size="lg"
              className="group bg-white text-purple-900 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <span className="relative z-10 flex items-center">
                {CTA_CONTENT.primaryCTA}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>

          <Button variant="outline" size="lg" className="cursor-pointer">
            {CTA_CONTENT.secondaryCTA}
          </Button>
        </div>

        <p className="text-white/60 text-sm">{CTA_CONTENT.disclaimer}</p>
      </div>
    </section>
  );
};

export default CTASection;
