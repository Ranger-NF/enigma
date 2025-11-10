import { cn } from '../lib/utils';
import { User, FileText, Check, Repeat } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: <User className="w-6 h-6" />,
    title: 'Register',
    description: 'Create your account to join the challenge.'
  },
  {
    id: 2,
    icon: <FileText className="w-6 h-6" />,
    title: 'Daily Questions',
    description: 'Get one question daily to test your skills.'
  },
  {
    id: 3,
    icon: <Check className="w-6 h-6" />,
    title: 'Solve',
    description: 'Use your knowledge to find the correct answer.'
  },
  {
    id: 4,
    icon: <Repeat className="w-6 h-6" />,
    title: 'Repeat',
    description: 'Come back tomorrow for a new challenge!'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-5xl mx-auto">
        {/* Main Title */}
        <h2 className="text-4xl md:text-5xl text-white text-center mb-6 font-pavelt font-normal tracking-wider [text-shadow:_0_0_1px_black,0_0_1px_black,0_0_1px_black,0_0_1px_black]">
          HOW IT WORKS
        </h2>

        {/* Description */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-3xl md:text-4xl font-bold text-[#E0E0FF] font-sans [text-shadow:_0_2px_4px_rgba(0,0,0,0.25)]">
            Join our 10-day treasure hunt!!
          </p>
          <p className="text-xl text-[#C0C0FF] mt-4 font-sans font-normal">
            One question per day, compete for the fastest completion time, and climb the daily leaderboard
          </p>
        </div>

        {/* Steps */}
        <div className="relative py-8">
          {/* Full section hover effect */}
          <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 lg:gap-8 px-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group">
                {/* Curved vector path with sharp arrowhead */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 w-24 h-24 -mt-12 -mr-6 z-0 overflow-visible">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-white/50 group-hover:text-white/80 transition-colors duration-300"
                      preserveAspectRatio="none"
                    >
                      {/* Curved path */}
                      <path
                        d="M0,50 Q25,25 50,50 T100,50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                      {/* Arrowhead */}
                      <path
                        d="M90,45 L100,50 L90,55 Z"
                        fill="currentColor"
                        className="transition-colors duration-300"
                      />
                    </svg>
                  </div>
                )}

                {/* Step content */}
                <div className="relative flex flex-col items-center p-6 rounded-xl transition-all duration-300 hover:bg-white/10 z-10">
                  {/* Step Circle */}
                  <div className={cn(
                    "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4",
                    "transition-all duration-300",
                    "bg-white/10 backdrop-blur-sm group-hover:bg-white group-hover:text-gray-900"
                  )}>
                    <span className="group-hover:text-gray-900 transition-colors">
                      {step.icon}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg font-bold text-white font-sans">
                    {step.title}
                  </h3>

                  {/* Step Description - Hidden by default, shown on hover */}
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-sm text-white/90 font-sans font-light",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      "max-w-[200px] mx-auto"
                    )}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
