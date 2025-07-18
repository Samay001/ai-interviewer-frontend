"use client";
import React from "react";
import { FEATURES } from "@/constants/landing";
import { Card } from "@/components/ui";
import { Feature } from "@/types";

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <Card hover gradient className="group">
      <div
        className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
      <p className="text-white/70 leading-relaxed">{feature.description}</p>
    </Card>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Leading Companies Choose Us
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Revolutionary AI technology that transforms how you discover and
            evaluate talent
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
