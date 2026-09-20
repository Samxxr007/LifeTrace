import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ArtistLoopProps {
  topArtists: { name: string; count: number }[];
  totalPlays: number;
}

export const ArtistLoop: React.FC<ArtistLoopProps> = ({ topArtists }) => {
  // We only show top 10
  const data = topArtists.slice(0, 10);
  const maxCount = Math.max(...data.map(d => d.count));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-parchment-100 border border-ink-200 p-3 shadow-lg">
          <p className="font-body text-ink-900 font-medium mb-1">{payload[0].payload.name}</p>
          <p className="font-mono text-xs text-ink-600">{payload[0].value} plays</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-12 border-t border-ink-200">
      <h3 className="font-mono text-sm uppercase tracking-widest text-ink-500 mb-8">
        Your Soundtrack
      </h3>
      
      <div 
        className="h-[400px] w-full"
        role="figure"
        aria-label="Bar chart showing the top 10 most played artists"
        title="Top Artists Bar Chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontFamily: 'var(--font-body)', fill: '#333333', fontSize: 14 }}
              width={140}
            />
            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => {
                // Gradient effect across bars from burnt-300 to burnt-700
                // burnt palette approx: 300=#D97757, 500=#A64024, 700=#732210 (example values)
                // We'll use CSS custom properties or valid hex if available. Since it's tailwind, 
                // we'll calculate opacity or use predefined hexes.
                // Assuming standard tailwind setup or generic hexes, let's use opacities of a base color for safety.
                const opacity = 1 - (index * 0.06);
                return <Cell key={`cell-${index}`} fill={`rgba(166, 64, 36, ${opacity})`} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
