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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import type { Interview } from "@/types";
import ChartEmptyState from "@/components/charts/ChartEmptyState";
import { BarChartIcon } from "lucide-react";

interface StatusDistributionChartProps {
  interviews: Interview[];
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  interviews,
}) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    {
      status: "Scheduled",
      count: interviews.filter((i) => i.status === "upcoming").length, // Use 'status' from the new Interview type
      fill: "#3b82f6",
    },
    {
      status: "Completed",
      count: interviews.filter((i) => i.status === "completed").length, // Use 'status' from the new Interview type
      fill: "#10b981",
    },
    {
      status: "Cancelled",
      count: interviews.filter((i) => i.status === "cancelled").length, // Use 'status' from the new Interview type
      fill: "#ef4444",
    },
  ];

  if (!mounted) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
          <CardDescription>
            Current interview status distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
          <CardDescription>
            Current interview status distribution
          </CardDescription>
        </CardHeader>
        <ChartEmptyState
          title="No Status Data"
          description="Schedule interviews to see their status distribution."
          icon={BarChartIcon}
        />
      </Card>
    );
  }

  return (
    <Card className="h-[450px]">
      <CardHeader className="pb-4">
        <CardTitle>Status Overview</CardTitle>
        <CardDescription>Current interview status distribution</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="status"
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
                formatter={(value, name) => [`${value} interviews`, name]}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    fillOpacity={
                      hoveredIndex === null
                        ? 1
                        : hoveredIndex === index
                        ? 1
                        : 0.3
                    }
                    style={{
                      filter:
                        hoveredIndex === index
                          ? "brightness(1.2) saturate(1.1)"
                          : "none",
                      transition: "all 0.3s ease-in-out",
                      transform:
                        hoveredIndex === index ? "scale(1.02)" : "scale(1)",
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {chartData.map((item, index) => (
            <div
              key={index}
              className={`text-center p-2 transition-all duration-300 ${
                hoveredIndex === null
                  ? ""
                  : hoveredIndex === index
                  ? "scale-105"
                  : "opacity-60"
              }`}
            >
              <div
                className="text-2xl font-bold transition-all duration-300"
                style={{
                  color: item.fill,
                  filter: hoveredIndex === index ? "brightness(1.2)" : "none",
                }}
              >
                {item.count}
              </div>
              <div className="text-xs text-muted-foreground">{item.status}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDistributionChart;
