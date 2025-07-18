"use client";
import React from "react";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/constants/landing";
import { Card } from "@/components/ui";
import { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Card hover className="relative">
      <Quote className="w-8 h-8 text-purple-400 mb-6" />

      <p className="text-white/90 text-lg leading-relaxed mb-6">
        &quot;{testimonial.quote}&quot;
      </p>

      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold mr-4">
          {testimonial.avatar}
        </div>
        <div>
          <div className="text-white font-semibold">{testimonial.author}</div>
          <div className="text-white/60 text-sm">{testimonial.role}</div>
        </div>
      </div>
    </Card>
  );
};

const TestimonialsSection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by Industry Leaders
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
