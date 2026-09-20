import React from 'react';

interface ActivityHeatmapProps {
  heatmap: number[][]; // 7 days (rows) x 24 hours (cols)
  totalRecords: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_LABELS = [0, 6, 12, 18, 23];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ heatmap, totalRecords }) => {
  // Find max for color scaling
  const flatData = heatmap.flat();
  const maxVal = Math.max(...flatData, 1);
  
  // Find peak for annotation
  let peakDay = 0;
  let peakHour = 0;
  let peakVal = 0;
  heatmap.forEach((dayRow, dIdx) => {
    dayRow.forEach((val, hIdx) => {
      if (val > peakVal) {
        peakVal = val;
        peakDay = dIdx;
        peakHour = hIdx;
      }
    });
  });

  const getColor = (value: number) => {
    if (value === 0) return 'bg-parchment-200';
    const ratio = value / maxVal;
    if (ratio < 0.25) return 'bg-burnt-200/50';
    if (ratio < 0.5) return 'bg-burnt-300';
    if (ratio < 0.75) return 'bg-burnt-500';
    return 'bg-burnt-700';
  };

  const getHourLabel = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}${ampm}`;
  };

  const peakDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][peakDay];

  return (
    <div className="py-12">
      <div className="mb-8">
        <h3 className="font-mono text-sm uppercase tracking-widest text-ink-500 mb-2">The Rhythm of Time</h3>
        <p className="font-display text-2xl text-ink-900">Activity Distribution</p>
      </div>

      <div 
        role="img" 
        aria-label={`Heatmap of activity over the week. Peak activity is on ${peakDayName} at ${getHourLabel(peakHour)} with ${peakVal} interactions.`}
        className="overflow-x-auto pb-6"
      >
        <div className="min-w-[600px]">
          {/* Grid Container */}
          <div className="flex">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between pr-4 font-mono text-xs text-ink-400 w-12 pt-2 pb-6">
              {DAYS.map(day => (
                <div key={day} className="h-6 flex items-center">{day}</div>
              ))}
            </div>

            {/* Heatmap Area */}
            <div className="flex-1">
              <div className="flex flex-col gap-1">
                {heatmap.map((dayRow, dIdx) => (
                  <div key={dIdx} className="flex gap-1 h-6">
                    {dayRow.map((val, hIdx) => {
                      const isPeak = dIdx === peakDay && hIdx === peakHour;
                      return (
                        <div
                          key={`${dIdx}-${hIdx}`}
                          className={`flex-1 min-w-[20px] rounded-sm transition-colors ${getColor(val)} ${isPeak ? 'ring-1 ring-ink-900 ring-offset-1 ring-offset-parchment-100' : ''}`}
                          title={`${DAYS[dIdx]} ${getHourLabel(hIdx)}: ${val} records`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between text-ink-400 font-mono text-xs mt-2 relative">
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-center" style={{ visibility: HOUR_LABELS.includes(h) ? 'visible' : 'hidden' }}>
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="font-mono text-xs text-ink-600 mt-4 border-t border-ink-200 pt-4">
        Peak recorded activity: {peakDayName} at {getHourLabel(peakHour)} ({peakVal} records)
      </p>
    </div>
  );
};
