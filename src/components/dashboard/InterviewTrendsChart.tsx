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
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Interview } from "@/types";
import ChartEmptyState from "@/components/charts/ChartEmptyState";
import { LineChartIcon } from "lucide-react";

interface InterviewTrendsChartProps {
  interviews: Interview[];
}

const InterviewTrendsChart: React.FC<InterviewTrendsChartProps> = ({
  interviews,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateTrendsData = (interviews: Interview[]) => {
    const monthlyData: {
      [key: string]: {
        scheduled: number;
        completed: number;
        cancelled: number;
      };
    } = {};

    interviews.forEach((interview) => {
      const date = new Date(interview.date);
      // Use full year to ensure correct sorting across years
      const monthKey = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { scheduled: 0, completed: 0, cancelled: 0 };
      }

      // All interviews are "scheduled" at some point
      monthlyData[monthKey].scheduled++;

      if (interview.status === "completed") {
        // Use 'status' from the new Interview type
        monthlyData[monthKey].completed++;
      } else if (interview.status === "cancelled") {
        // Use 'status' from the new Interview type
        monthlyData[monthKey].cancelled++;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      // Parse monthKey (e.g., "Jul 2025") back to Date for accurate sorting
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map((monthKey) => ({
      month: monthKey.split(" ")[0], // Just the month abbreviation for display
      ...monthlyData[monthKey],
    }));
  };

  const chartData = calculateTrendsData(interviews);

  if (!mounted) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle>Interview Trends</CardTitle>
          <CardDescription>
            Monthly interview statistics over the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0 || chartData.length === 0) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle>Interview Trends</CardTitle>
          <CardDescription>
            Monthly interview statistics throughout 2024
          </CardDescription>
        </CardHeader>
        <ChartEmptyState
          title="No Trend Data"
          description="Schedule and complete interviews to see monthly trends."
          icon={LineChartIcon}
        />
      </Card>
    );
  }

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-4">
        <CardTitle>Interview Trends</CardTitle>
        <CardDescription>
          Monthly interview statistics throughout 2024
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="scheduledGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="completedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="cancelledGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
              />
              <Area
                type="monotone"
                dataKey="scheduled"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#scheduledGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="#10b981"
                fill="url(#completedGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cancelled"
                stackId="1"
                stroke="#ef4444"
                fill="url(#cancelledGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewTrendsChart;
