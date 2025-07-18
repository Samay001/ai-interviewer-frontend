"use client";
import React from "react";
import { STATISTICS } from "@/constants/landing";
import { Statistic } from "@/types";

interface StatCardProps {
  stat: Statistic;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const Icon = stat.icon;

  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {stat.number}
      </div>
      <div className="text-white/70 font-medium">{stat.label}</div>
    </div>
  );
};

const StatsSection: React.FC = () => {
  return (
    <section
      id="stats"
      className="py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATISTICS.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
