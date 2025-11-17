import { cn } from '../lib/utils';
import { User, FileText, Check, Repeat } from 'lucide-react';
import Footer from "../components/ui/footer";

const steps = [
  { id: 1, icon: <User className="w-6 h-6" />, title: 'Register', description: 'Create your account to join the challenge.' },
  { id: 2, icon: <FileText className="w-6 h-6" />, title: 'Daily Questions', description: 'Get one question daily to test your skills.' },
  { id: 3, icon: <Check className="w-6 h-6" />, title: 'Solve', description: 'Use your knowledge to find the correct answer.' },
  { id: 4, icon: <Repeat className="w-6 h-6" />, title: 'Repeat', description: 'Come back tomorrow for a new challenge!' }
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Title */}
          <h2 className="text-4xl md:text-5xl text-white text-center mb-6 font-pavelt tracking-wider">
            HOW IT WORKS
          </h2>

          {/* Subtitle */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-3xl md:text-4xl font-bold text-[#E0E0FF]">
              Join our 10-day treasure hunt!!
            </p>
            <p className="text-md md:text-xl text-[#C0C0FF] mt-4">
              One question per day, compete for the fastest completion time, and climb the daily leaderboard
            </p>
          </div>

          {/* Steps */}
          <div className="relative py-8 group">
            <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:px-4 place-items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="relative group flex flex-col items-center">

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute right-[-50px] top-1/2 transform -translate-y-1/2 w-24 h-24 z-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-white/40 group-hover:text-white transition-colors">
                        <path d="M0,50 Q25,25 50,50 T100,50"
                              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M90,45 L100,50 L90,55 Z" fill="currentColor" />
                      </svg>
                    </div>
                  )}

                  {/* Box */}
                  <div className="flex flex-col items-center p-6 rounded-xl hover:bg-white/10 transition-all duration-300 relative z-10 text-center">

                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 bg-white/10 backdrop-blur-sm group-hover:bg-white group-hover:text-gray-900 transition-all">
                      {step.icon}
                    </div>

                    <h3 className="text-lg font-bold text-white">{step.title}</h3>

                    <p className="text-sm text-white/80 mt-2 opacity-0 md:group-hover:opacity-100 transition-opacity max-w-[200px]">
                      {step.description}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <Footer />

    </div>
  );
};

export default HowItWorks;
