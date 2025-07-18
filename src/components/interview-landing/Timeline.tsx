import { Check, X } from "lucide-react";
import type { timelineStepType } from "@/types";

interface TimelineProps {
  data: timelineStepType[];
}

const Timeline = ({ data }: TimelineProps) => {
  return (
    <div className="space-y-3">
      {data.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step.status ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {step.status ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              step.status ? "text-white" : "text-red-200"
            }`}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
