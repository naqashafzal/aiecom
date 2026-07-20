"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ChartData {
  day: string;
  revenue: number;
  orders: number;
}

export default function AnalyticsChart({ data, currencyCode = "USD" }: { data: ChartData[], currencyCode?: string }) {
  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e5" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#5c5f62' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#5c5f62' }}
            tickFormatter={(value) => {
              try {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(value);
              } catch(e) {
                return `$${value}`;
              }
            }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const formattedRevenue = (() => {
                  try {
                    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(Number(payload[0].value));
                  } catch(e) {
                    return `$${Number(payload[0].value).toFixed(2)}`;
                  }
                })();
                return (
                  <div className="bg-slate-800 text-white text-xs py-2 px-3 rounded shadow-lg">
                    <div className="font-semibold mb-1">{formattedRevenue}</div>
                    <div className="text-slate-300">{payload[0].payload.orders} orders</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
