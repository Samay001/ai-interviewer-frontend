"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Interview } from "@/types";
import ChartEmptyState from "@/components/charts/ChartEmptyState";
import { TrendingUp } from "lucide-react";

interface InterviewPerformanceChartProps {
  interviews: Interview[];
}

const InterviewPerformanceChart: React.FC<InterviewPerformanceChartProps> = ({
  interviews,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePerformanceData = (interviews: Interview[]) => {
    const monthlyData: {
      [key: string]: {
        totalScore: number;
        count: number;
        successfulCount: number;
      };
    } = {};

    interviews.forEach((interview) => {
      // Only consider completed interviews with a valid score
      if (
        interview.status === "completed" &&
        typeof interview.score === "number"
      ) {
        const date = new Date(interview.date);
        // Use full year to ensure correct sorting across years
        const monthKey = date.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            totalScore: 0,
            count: 0,
            successfulCount: 0,
          };
        }
        monthlyData[monthKey].totalScore += interview.score;
        monthlyData[monthKey].count++;
        if (interview.score >= 3.5) {
          // Assuming 3.5 out of 5 (70%) is success threshold
          monthlyData[monthKey].successfulCount++;
        }
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      // Parse monthKey (e.g., "Jul 2025") back to Date for accurate sorting
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map((monthKey) => {
      const { totalScore, count, successfulCount } = monthlyData[monthKey];
      const successRate = count > 0 ? (successfulCount / count) * 100 : 0;
      const averageScore = count > 0 ? totalScore / count : 0;
      // Satisfaction is directly the average score on a 0-5 scale
      const satisfaction = Number.parseFloat(averageScore.toFixed(1));

      return {
        month: monthKey.split(" ")[0], // Just the month abbreviation for display
        successRate: Number.parseFloat(successRate.toFixed(1)),
        satisfaction: satisfaction,
      };
    });
  };

  const chartData = calculatePerformanceData(interviews);

  if (!mounted) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Interview Performance</CardTitle>
          <CardDescription>Weekly performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no completed interviews with scores are available
  if (
    interviews.filter(
      (i) => i.status === "completed" && typeof i.score === "number"
    ).length === 0
  ) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Interview Performance</CardTitle>
          <CardDescription>
            Weekly performance metrics and trends
          </CardDescription>
        </CardHeader>
        <ChartEmptyState
          title="No Performance Data"
          description="Complete some interviews with scores to see performance metrics and trends."
          icon={TrendingUp}
        />
      </Card>
    );
  }

  return (
    <Card className="h-[450px]">
      <CardHeader className="pb-4">
        <CardTitle>Interview Performance</CardTitle>
        <CardDescription>Weekly performance metrics and trends</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value, name) => [
                  `${value}${name === "successRate" ? "%" : ""}`, // Success rate is percentage
                  name === "successRate"
                    ? "Success Rate"
                    : "Satisfaction (1-5)", // Satisfaction is 1-5
                ]}
              />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="satisfaction"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Success Rate (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Satisfaction (1-5)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewPerformanceChart;
