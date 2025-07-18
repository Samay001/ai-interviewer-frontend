"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { timelineStepType } from "@/types";

interface SystemCheckProps {
  data: timelineStepType[];
}

const SystemCheck = ({ data }: SystemCheckProps) => {
  const allSystemsReady = data.every((item) => item.status);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          System Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.title}</span>
            <div
              className={`w-3 h-3 rounded-full ${
                item.status ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          {allSystemsReady ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                All systems ready
              </Badge>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
              >
                Setup required
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemCheck;
