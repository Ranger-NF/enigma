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
}

/**
 * ProgressGrid - shows a compact grid of days with completion/access state.
 * Clicking an available day will call onSelectDay(day).
 * Memoized to prevent unnecessary re-renders.
 */
const ProgressGrid = memo(function ProgressGrid({ days, displayDay, onSelectDay }: Props) {
  return (
    <div className="flex flex-col flex-grow min-h-0 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">Your Progress</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-grow min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent">
        { days ? days.map((d) => {
          const isAvailable = d.isAccessible && d.isDateUnlocked !== false;
          return (
            <div
              key={d.day}
              className={`p-3 rounded-lg border cursor-pointer transition-all text-center border-gray-400
                ${d.isCompleted ? 'bg-green-900 text-white' :
                  isAvailable ? 'bg-blue-50 text-black' :
                  'bg-black/30 '}
                ${d.day === displayDay ? 'border-4' : ''}`}
              onClick={() => isAvailable && onSelectDay(d.day)}
              title={d.reason}
            >
              <div className="text-sm font-bold">Day {d.day}</div>
              <div className="text-[10px] pt-1">
                {d.isCompleted ? 'Completed' : isAvailable ? 'Available' : 'Locked'}
              </div>
            </div>
          );
        }): <div></div>}
      </div>
    </div>
  );
});

export default ProgressGrid;
