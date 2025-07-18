import type React from "react";
import { CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface ChartEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  title,
  description,
  icon: Icon = BarChart3,
}) => {
  return (
    <CardContent className="p-6 flex flex-col items-center justify-center h-[300px] text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
    </CardContent>
  );
};

export default ChartEmptyState;
