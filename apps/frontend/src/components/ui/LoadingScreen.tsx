import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 z-50 transition-opacity duration-500 flex items-center justify-center",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-primary animate-spin"></div>
        <div className="mt-4 text-center text-lg font-semibold text-primary">
          Loading...
        </div>
      </div>
    </div>
  );
}
