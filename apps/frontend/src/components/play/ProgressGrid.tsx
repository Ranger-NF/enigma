import { memo } from 'react';

interface Day {
  day: number;
  isCompleted: boolean;
  isAccessible: boolean;
  isDateUnlocked?: boolean;
  reason?: string;
}

interface Props {
  days: Day[];
  displayDay: number;
  onSelectDay: (day: number) => void;
  maxAccessibleDay: number;
}

/**
 * ProgressGrid - shows a compact grid of days with completion/access state.
 * Clicking an available day will call onSelectDay(day).
 * Memoized to prevent unnecessary re-renders.
 */
const ProgressGrid = memo(function ProgressGrid({ days, displayDay, onSelectDay, maxAccessibleDay }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Your Progress</h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {days.map((d) => {
          const isAvailable = d.isAccessible && d.day <= maxAccessibleDay && d.isDateUnlocked !== false;
          return (
            <div
              key={d.day}
              className={`p-3 rounded-lg border cursor-pointer transition-all text-center text-black
                ${d.isCompleted ? 'bg-green-50 border-green-200' :
                  isAvailable ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'}
                ${d.day === displayDay ? 'ring-2 ring-primary' : ''}`}
              onClick={() => isAvailable && onSelectDay(d.day)}
              title={d.reason}
            >
              <div className="text-sm font-bold">Day {d.day}</div>
              <div className="text-xs mt-1">
                {d.isCompleted ? 'Completed' : isAvailable ? 'Available' : 'Locked'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ProgressGrid;
