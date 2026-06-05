"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Language } from "@/lib/i18n/types";

interface AnxietyTrendChartProps {
  data: { index: number; score: number; label: string }[];
  anxietyLabel: string;
  language: Language;
}

export function AnxietyTrendChart({
  data,
  anxietyLabel,
  language,
}: AnxietyTrendChartProps) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#e8d5d0" strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            tick={{ fontSize: 11, fill: "#7a6b68" }}
            axisLine={{ stroke: "#e8d5d0" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#7a6b68" }}
            axisLine={{ stroke: "#e8d5d0" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fffcfa",
              border: "1px solid #e8d5d0",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value) => [value, anxietyLabel]}
            labelFormatter={(label) => formatChartLabel(Number(label), language)}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#a67f7a"
            strokeWidth={2.5}
            dot={{ fill: "#a67f7a", r: 4 }}
            activeDot={{ r: 6, fill: "#a67f7a" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatChartLabel(index: number, language: Language): string {
  return language === "zh" ? `第 ${index} 次` : `Reflection ${index}`;
}
