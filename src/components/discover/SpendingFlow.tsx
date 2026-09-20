import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendingFlowProps {
  monthlySpending: Record<string, number>;
  topCategories: { name: string; count: number; total: number }[];
}

export const SpendingFlow: React.FC<SpendingFlowProps> = ({ monthlySpending, topCategories }) => {
  const chartData = Object.entries(monthlySpending)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month)); // naive sort, assuming YYYY-MM format

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-parchment-100 border border-ink-200 p-3 shadow-lg">
          <p className="font-mono text-xs text-ink-500 mb-1">{label}</p>
          <p className="font-display text-lg text-ink-900">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxCategoryTotal = Math.max(...topCategories.map(c => c.total), 1);

  return (
    <div className="py-12 border-t border-ink-200">
      <h3 className="font-mono text-sm uppercase tracking-widest text-ink-500 mb-8">
        How Money Moved
      </h3>

      <div 
        className="h-[300px] w-full mb-12"
        role="figure"
        aria-label="Area chart showing monthly spending over time"
        title="Monthly Spending Trend"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4A7c59" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4A7c59" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#666' }} 
              minTickGap={30}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#4A7c59" 
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {topCategories.map(cat => (
          <div key={cat.name} className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-body text-ink-800">{cat.name}</span>
              <span className="font-mono text-ink-600">₹{cat.total.toLocaleString()}</span>
            </div>
            <div className="w-full h-1 bg-ink-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-forest-500" 
                style={{ width: `${(cat.total / maxCategoryTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
