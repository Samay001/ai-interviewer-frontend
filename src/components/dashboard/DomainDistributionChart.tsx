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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Interview } from "@/types";
import ChartEmptyState from "@/components/charts/ChartEmptyState";
import { PieChartIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DomainDistributionChartProps {
  interviews: Interview[];
}

const DomainDistributionChart: React.FC<DomainDistributionChartProps> = ({
  interviews,
}) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const domainCounts = interviews.reduce((acc, interview) => {
    if (interview.domain) {
      // Normalize domain to lowercase for case-insensitive counting
      const normalizedDomain = interview.domain.toLowerCase();
      acc[normalizedDomain] = (acc[normalizedDomain] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalInterviews = interviews.length;

  const chartData = Object.entries(domainCounts)
    .map(([name, count], index) => {
      const value =
        totalInterviews > 0
          ? Number.parseFloat(((count / totalInterviews) * 100).toFixed(1))
          : 0;
      const colors = [
        "#3b82f6", // blue-500
        "#10b981", // green-500
        "#8b5cf6", // violet-500
        "#f59e0b", // amber-500
        "#ef4444", // red-500
        "#6366f1", // indigo-500
        "#06b6d4", // cyan-500
        "#a855f7", // purple-500
        "#ec4899", // pink-500
        "#eab308", // yellow-500
        "#14b8a6", // teal-500
        "#d946ef", // fuchsia-500
      ];
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize for display
        value,
        count,
        fill: colors[index % colors.length],
      };
    })
    .sort((a, b) => b.value - a.value);

  if (!mounted) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Domain Distribution</CardTitle>
          <CardDescription>Interview distribution by domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0 || chartData.length === 0) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Domain Distribution</CardTitle>
          <CardDescription>
            Interview distribution by technical domain
          </CardDescription>
        </CardHeader>
        <ChartEmptyState
          title="No Domain Data"
          description="Schedule some interviews to see the distribution of technical domains."
          icon={PieChartIcon}
        />
      </Card>
    );
  }

  return (
    <Card className="h-[450px]">
      <CardHeader className="pb-4">
        <CardTitle>Domain Distribution</CardTitle>
        <CardDescription>
          Interview distribution by technical domain
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke="white"
                    strokeWidth={2}
                    fillOpacity={
                      hoveredIndex === null
                        ? 1
                        : hoveredIndex === index
                        ? 1
                        : 0.4
                    }
                    style={{
                      filter:
                        hoveredIndex === index
                          ? "brightness(1.15) saturate(1.1)"
                          : "none",
                      transition: "all 0.3s ease-in-out",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value, name, props) => [
                  `${props.payload.count} interviews (${value}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ScrollArea className="h-[100px] w-full mt-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pr-4">
            {chartData.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm p-1 rounded transition-all duration-300 ${
                  hoveredIndex === null
                    ? ""
                    : hoveredIndex === index
                    ? "bg-muted/30 scale-105"
                    : "opacity-50"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: item.fill,
                    filter: hoveredIndex === index ? "brightness(1.2)" : "none",
                    transform:
                      hoveredIndex === index ? "scale(1.2)" : "scale(1)",
                  }}
                />
                <span className="text-muted-foreground truncate">
                  {item.name}
                </span>
                <span className="font-medium ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DomainDistributionChart;