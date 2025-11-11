import React from "react";

interface DayProgressProps {
  day: number; // current day (e.g. 3)
  totalDays?: number; // total number of dots (default: 8)
}

const DayProgress: React.FC<DayProgressProps> = ({ day, totalDays = 8 }) => {
  return (
    <div className="flex items-center justify-between w-full h-[40px] md:h-[70px] border border-white/20 backdrop-blur-md bg-white/10 px-4">
      {/* Left Text */}
      <span className="text-white text-[12px] font-semibold tracking-wider md:text-xl">
        DAY {day} of 10
      </span>

      {/* Progress Dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalDays }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
              i < day
                ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                : "border border-[1px] border-white"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default DayProgress;
