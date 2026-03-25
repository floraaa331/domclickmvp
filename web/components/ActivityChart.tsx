"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  day: string;
  users: number;
  calculations: number;
}

const data: DataPoint[] = [
  { day: "Пн", users: 120, calculations: 45 },
  { day: "Вт", users: 150, calculations: 62 },
  { day: "Ср", users: 180, calculations: 78 },
  { day: "Чт", users: 140, calculations: 55 },
  { day: "Пт", users: 210, calculations: 89 },
  { day: "Сб", users: 95, calculations: 34 },
  { day: "Вс", users: 75, calculations: 28 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-gray-600 dark:text-gray-400">
          <span
            className="inline-block w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          {entry.dataKey === "users" ? "Пользователи" : "Расчёты"}:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function ActivityChart() {
  return (
    <div className="w-full h-[300px] sm:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradientUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a73e8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1a73e8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradientCalc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8ab4f8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8ab4f8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            opacity={0.08}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fill: "#9ca3af" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#1a73e8"
            strokeWidth={2.5}
            fill="url(#gradientUsers)"
          />
          <Area
            type="monotone"
            dataKey="calculations"
            stroke="#8ab4f8"
            strokeWidth={2}
            fill="url(#gradientCalc)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
