import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePlay } from "../hooks/usePlay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import leftArrow from "@/assets/left-arrow.svg";
import { calculateGridLayout, ImageSquare } from "@/components/play/ImageGrid";
import TutorialModal from "@/components/play/tutorialModal";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

const DayBox = ({
  day,
  left,
  top,
  dayTop,
  statusTop,
  isCompleted,
  isAccessible,
  isDateUnlocked,
}: {
  day: number;
  left: string;
  top: string;
  dayTop: string;
  statusTop: string;
  isCompleted?: boolean;
  isAccessible?: boolean;
  isDateUnlocked?: boolean;
}) => {
  // Determine state: completed > available > locked
  // A day is available if it's accessible AND date is unlocked
  // Use truthy check for isAccessible (true), and ensure isDateUnlocked is not explicitly false
  const isAvailable = isAccessible === true && isDateUnlocked !== false;

  let bgColor = "bg-gray-400"; // default for locked
  let textColor = "text-white";
  let statusText = "Locked";

  if (isCompleted) {
    bgColor = "bg-[#d4c4b0]"; // beige for completed
    textColor = "text-black";
    statusText = "Completed";
  } else if (isAvailable) {
    bgColor = "bg-white"; // white for available/unlocked
    textColor = "text-black";
    statusText = "In Progress";
  }

  return (
    <>
      <div
        className={`absolute ${bgColor} w-[126.08px] h-[94px]`}
        style={{ left, top }}
      />
      <div
        className={`absolute font-whirlyBirdie font-bold ${textColor} text-center w-[110px] h-[24px] text-[18px] leading-[24px] whitespace-nowrap overflow-hidden`}
        style={{ left: `${parseFloat(left) + 8}px`, top: dayTop }}
      >
        day {day}
      </div>
      <div
        className={`absolute font-poppins font-medium ${textColor} text-center w-[105px] h-[24px] text-[16px] leading-[24px]`}
        style={{ left: `${parseFloat(left) + 10}px`, top: statusTop }}
      >
        {statusText}
      </div>
    </>
  );
};

// Component to handle individual image loading with cached image detection
const ImageSquareWithLoader = ({
  image,
  index,
  isLoaded,
  onLoad,
  isSingleImage,
}: {
  image: string;
  index: number;
  isLoaded: boolean;
  onLoad: (index: number) => void;
  isSingleImage: boolean;
}) => {
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Check if image is already loaded (cached) when component mounts or image changes
  React.useEffect(() => {
    // Use a small delay to ensure ref is attached
    const checkImage = () => {
      if (
        imgRef.current &&
        imgRef.current.complete &&
        imgRef.current.naturalHeight !== 0
      ) {
        // Image is already loaded (cached)
        onLoad(index);
      }
    };

    // Check immediately and after a short delay to handle cached images
    checkImage();
    const timeout = setTimeout(checkImage, 10);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, index]); // Only depend on image URL and index, not onLoad callback

  return (
    <div
      className="relative aspect-square border border-white rounded overflow-hidden bg-black"
      style={isSingleImage ? { maxWidth: "300px", margin: "0 auto" } : {}}
    >
      <img
        ref={imgRef}
        src={image}
        alt={`Question image ${index + 1}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => onLoad(index)}
        onError={() => onLoad(index)}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

// Dynamically generate day box positions in a 3-column grid so it scales
// with however many questions exist in Firestore.
const generateDayBoxes = (count: number) => {
  const baseLeft = 24.99;
  // Base top is 0 because the scrollable container itself is positioned
  // at top-[114px] inside the right panel.
  const baseTop = 0;
  const colSpacing = 146.08;
  const rowSpacing = 114;

  return Array.from({ length: count }, (_, i) => {
    const day = i + 1;
    const col = i % 3;
    const row = Math.floor(i / 3);
    const top = baseTop + row * rowSpacing;
    const left = baseLeft + col * colSpacing;

    return {
      day,
      left: `${left}px`,
      top: `${top}px`,
      dayTop: `${top + 25}px`,
      statusTop: `${top + 47}px`,
    };
  });
};

function PlayPage() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [showFinalCongrats, setShowFinalCongrats] = useState(false);
  const [squareImagesLoaded, setSquareImagesLoaded] = useState<boolean[]>([]);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const [questionHeight, setQuestionHeight] = useState(113.5); // default height

  // For tutorial
  const [isOpen, setIsOpen] = useState(false);

  const {
    displayDay,
    question,
    progress,
    cooldownSeconds,
    initialize,
    fetchQuestion,
    fetchProgress,
    submitAnswer,
  } = usePlay(currentUser);

  const dayBoxes = useMemo(
    () =>
      generateDayBoxes(progress?.totalDays ?? progress?.progress?.length ?? 5),
    [progress?.totalDays, progress?.progress?.length],
  );

  const { day } = useParams<{ day?: string }>();
  const urlDay = day ? Number(day) : null;
  const loadingRef = useRef(false);

  const expectedDay = urlDay && Number.isFinite(urlDay) ? urlDay : displayDay;

  // Control main page scrollbar depending on route (desktop only):
  // - /play           → main scrollbar visible
  // - /play/:day      → main scrollbar hidden on desktop (≥1024px),
  //                     but still visible on mobile so users can scroll.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    const isPlayDetail =
      urlDay !== null && !Number.isNaN(urlDay) && Number.isFinite(urlDay);
    const isDesktop = window.innerWidth >= 1024;

    if (isPlayDetail && isDesktop) {
      htmlEl.style.overflow = "hidden";
      bodyEl.style.overflow = "hidden";
    } else {
      htmlEl.style.overflow = "";
      bodyEl.style.overflow = "";
    }

    return () => {
      htmlEl.style.overflow = "";
      bodyEl.style.overflow = "";
    };
  }, [urlDay]);

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth >= 1024) {
        const baseWidth = 1510;
        const baseHeight = 900;
        setScaleX(Math.max(window.innerWidth / baseWidth, 0.7));
        setScaleY(Math.max((window.innerHeight - 64) / baseHeight, 0.7));
      } else {
        setScaleX(1);
        setScaleY(1);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Get actual images array from question
  const getQuestionImages = (): string[] => {
    if (!question?.image) return [];
    if (Array.isArray(question.image)) {
      return question.image;
    }
    // If string, return as single element array (backward compatibility)
    return [question.image];
  };

  const questionImages = getQuestionImages();

  // Calculate grid layout for desktop with dynamic question height
  const availableHeight = Math.max(528 - questionHeight, 100); // Total height minus question area, minimum 100px
  const imageStartTop = 249 + questionHeight; // Container top + question height
  const desktopImageLayout = calculateGridLayout(
    questionImages.length,
    918.03, // container width
    availableHeight, // available height (dynamic based on question height)
    imageStartTop, // start top (after divider line, dynamic)
    29, // start left (container left)
  );

  useEffect(() => {
    // Reset loaded state when image URLs actually change
    setSquareImagesLoaded(new Array(questionImages.length).fill(false));
  }, [questionImages.join(",")]); // Track actual image URLs, not just length

  // Measure question height and update divider position
  useEffect(() => {
    const measureQuestion = () => {
      if (questionRef.current) {
        const height = questionRef.current.offsetHeight;
        // Add padding (20px top) + some spacing (10px) for the divider
        // Ensure minimum height of 113.5px (original value)
        const calculatedHeight = Math.max(height + 20 + 10, 113.5);
        setQuestionHeight(calculatedHeight);
      }
    };

    // Measure after DOM update
    requestAnimationFrame(() => {
      measureQuestion();
    });

    // Also measure on window resize (for scaling)
    window.addEventListener("resize", measureQuestion);
    return () => window.removeEventListener("resize", measureQuestion);
  }, [question?.question, scaleX, scaleY]);

  useEffect(() => {
    if (!currentUser) return;

    // Prevent duplicate requests - if already loading, skip
    if (loadingRef.current) return;

    // If question is already loaded for this day, skip fetching
    // This check handles the case when navigating back to the same day
    if (question?.day === urlDay && urlDay !== null) {
      return;
    }

    // Always ensure progress is loaded first
    const loadData = async () => {
      loadingRef.current = true;
      try {
        // If day is present in URL → load that day
        if (urlDay && !Number.isNaN(urlDay)) {
          // Ensure progress is loaded (might be cached, but that's ok)
          await fetchProgress();
          await fetchQuestion(urlDay);
        } else {
          // Otherwise fallback to normal behavior
          initialize();
        }
      } finally {
        loadingRef.current = false;
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, urlDay]); // Intentionally exclude function dependencies to prevent unnecessary re-runs

  useEffect(() => {
    if (question?.isCompleted && displayDay === progress?.progress.length) {
      setShowFinalCongrats(true);
    }
  }, [question, displayDay, progress]);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (
      message &&
      (message.includes("Correct") ||
        message.includes("Success") ||
        message.includes("🎉"))
    ) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setMessage("Please enter an answer");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await submitAnswer(answer.trim());
      if (!res.ok) {
        setMessage(
          res.message || (res.data && res.data.result) || "Submission failed",
        );
      } else {
        setMessage(res.data?.result || "Submitted");
        if (res.data?.correct) {
          setAnswer("");
          // The usePlay hook's submitAnswer already handles fetching the next question
          // Navigate to next question URL to update the route
          const nextDay = displayDay + 1;
          const maxDay = progress?.totalDays || 10;

          // Wait a brief moment for the hook to process, then navigate
          // This ensures the next question is fetched before URL change
          setTimeout(() => {
            if (nextDay <= maxDay) {
              navigate(`/play/${nextDay}`, { replace: false });
            }
          }, 100);
        }
      }
    } catch {
      setMessage("Error submitting answer");
    } finally {
      setSubmitting(false);
    }
  };

  const isQuestionReady =
    question &&
    typeof question.day === "number" &&
    question.day === expectedDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-transparent relative overflow-hidden"
      ref={containerRef}
    >
      {/* Desktop Layout */}
      <div
        className="font-orbitron absolute top-0 left-0 hidden lg:block origin-top-left"
        style={{
          transform: `scale(${scaleX}, ${scaleY})`,
          width: `${100 / scaleX}%`,
          height: `${100 / scaleY}%`,
        }}
      >
        {/* Top Rectangle */}
        <div className="absolute bg-black w-[1452px] h-[104px] left-[29.01px] top-[121px]">
          <button
            onClick={() => navigate(-1)}
            className="absolute flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity left-[4.03%] top-[34.62%] w-[30px] h-[30px] bg-transparent border-none"
          >
            <img
              src={leftArrow}
              alt="Left arrow"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </button>
        </div>

        {/* Day X Of Y Text */}
        <div className="absolute font-whirlyBirdie font-bold text-white text-center w-[210px] h-[29px] left-[130.01px] top-[157px] text-[24px] leading-[29px] whitespace-nowrap">
          Day {displayDay} Of {progress?.progress.length || 10}
        </div>

        {/* Tutorial Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bg-black text-white border border-white px-4 py-2 rounded hover:bg-gray-800 transition-colors w-[138px] h-[45px] left-[1321px] top-[150px]"
        >
          Tutorial
        </button>

        {/* Left Rectangle */}
        <div className="absolute bg-black border border-black w-[918.03px] h-[528px] left-[29px] top-[249px]">
          <div
            ref={questionRef}
            className="absolute font-whirlyBirdie font-bold text-white w-[733px] left-[calc(50%-733px/2-50px)] top-0 pt-[20px] text-[20px] leading-[30px] break-words"
          >
            {isQuestionReady ? question.question : <LoadingSpinner />}
          </div>
          <div
            className="absolute w-[918.03px] h-0 left-0 border border-white"
            style={{ top: `${questionHeight}px` }}
          />
        </div>

        {/* Image Squares - Dynamic Grid */}
        {questionImages.map(
          (image, i) =>
            desktopImageLayout[i] && (
              <ImageSquare
                key={i}
                index={i}
                position={desktopImageLayout[i]}
                image={image}
                loaded={squareImagesLoaded[i] || false}
                onLoad={() =>
                  setSquareImagesLoaded((prev) => {
                    const newState = [...prev];
                    newState[i] = true;
                    return newState;
                  })
                }
              />
            ),
        )}

        {/* ANSWER Text */}
        <div className="absolute font-whirlyBirdie font-bold text-black text-center w-[191px] h-[29px] left-[29px] top-[808px] text-[24px] leading-[29px]">
          ANSWER :
        </div>

        {/* Answer Input */}
        <div className="absolute w-[701px] h-[73px] left-[29.01px] top-[851px]">
          <Input
            id="answer-input"
            placeholder=""
            value={answer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAnswer(e.target.value)
            }
            disabled={cooldownSeconds > 0 || submitting}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && handleSubmit()
            }
            className="w-full h-full"
          />
        </div>

        {/* Placeholder Text */}
        {!answer && (
          <div className="absolute pointer-events-none font-poppins font-medium w-[218px] h-[36px] left-[60px] top-[872px] text-[24px] leading-[36px] text-[#6B6B6B]">
            Enter Your Answer
          </div>
        )}

        {/* Submit Button */}
        <div className="absolute w-[216px] h-[73px] left-[731px] top-[851px]">
          <Button
            onClick={handleSubmit}
            disabled={submitting || cooldownSeconds > 0}
            className="w-full h-full bg-black text-white font-whirlyBirdie font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center overflow-hidden px-2"
          >
            <span
              className={`whitespace-nowrap ${submitting ? "text-[20px] leading-[24px]" : "text-[24px] leading-[29px]"}`}
            >
              {submitting
                ? "Submitting..."
                : cooldownSeconds > 0
                  ? `Wait ${cooldownSeconds}s`
                  : "SUBMIT"}
            </span>
          </Button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`absolute font-poppins text-base font-medium left-[29px] top-[940px] max-w-[900px] ${message.includes("Correct") || message.includes("Success") || message.includes("🎉") ? "text-[#10b981]" : "text-[#ef4444]"}`}
          >
            {message}
          </div>
        )}

        {/* Right Rectangle */}
        <div className="absolute bg-black w-[514px] h-[675px] left-[968.02px] top-[249px] overflow-hidden">
          <div className="absolute font-whirlyBirdie font-bold text-white text-center w-[332px] h-[29px] left-[25px] top-[55px] text-[24px] leading-[29px]">
            Your progress
          </div>

          {/* Scrollable Day Boxes + Progress Bar */}
          <div className="absolute left-0 top-[114px] w-full h-[523px] overflow-y-auto internal-progress-scroll">
            <div className="relative w-full h-max">
              {dayBoxes.map(({ day, left, top, dayTop, statusTop }) => {
                const dayProgress = progress?.progress.find(
                  (p) => p.day === day,
                );
                return (
                  <DayBox
                    key={day}
                    day={day}
                    left={left}
                    top={top}
                    dayTop={dayTop}
                    statusTop={statusTop}
                    isCompleted={dayProgress?.isCompleted}
                    isAccessible={dayProgress?.isAccessible}
                    isDateUnlocked={dayProgress?.isDateUnlocked}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden px-4 py-6 space-y-6 pb-20">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-black text-white px-4 pt-3 pb-1 rounded-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 mt-2"
          >
            <img
              src={leftArrow}
              alt="Back"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </button>
          <div className="font-whirlyBirdie font-bold text-[11px] whitespace-nowrap mt-2">
            Day {displayDay} Of {progress?.progress.length || 10}
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-transparent border border-white px-3 py-1.5 rounded text-sm hover:bg-gray-800 transition-colors mt-2"
          >
            Tutorial
          </button>
        </div>

        {/* Question Section */}
        <div className="bg-black text-white p-4 rounded-lg">
          <div className="font-whirlyBirdie font-bold text-[11px] mb-2">
            {question?.question ||
              "I hold two people inside me forever, but i'm not a home. What am i ?"}
          </div>
          <div className="w-full h-px bg-white my-3" />

          {/* Image Grid - Dynamic */}
          <div
            className="mt-4 max-w-[200px] mx-auto"
            style={{
              display: "grid",
              gridTemplateColumns:
                questionImages.length === 1
                  ? "1fr"
                  : questionImages.length === 2
                    ? "repeat(2, 1fr)"
                    : questionImages.length === 3
                      ? "repeat(2, 1fr)"
                      : questionImages.length <= 4
                        ? "repeat(2, 1fr)"
                        : "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {questionImages.map((image, i) => (
              <ImageSquareWithLoader
                key={`${image}-${i}`}
                image={image}
                index={i}
                isLoaded={squareImagesLoaded[i] || false}
                isSingleImage={questionImages.length === 1}
                onLoad={(idx) =>
                  setSquareImagesLoaded((prev) => {
                    const newState = [...prev];
                    newState[idx] = true;
                    return newState;
                  })
                }
              />
            ))}
          </div>
        </div>

        {/* Answer Section */}
        <div className="space-y-3">
          <div className="font-whirlyBirdie font-bold text-black text-lg">
            ANSWER :
          </div>
          <div className="relative">
            <Input
              id="answer-input-mobile"
              placeholder="Enter Your Answer"
              value={answer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAnswer(e.target.value)
              }
              disabled={cooldownSeconds > 0 || submitting}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleSubmit()
              }
              className="w-full h-12 text-sm"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting || cooldownSeconds > 0}
            className="w-full bg-black text-white font-whirlyBirdie font-bold hover:bg-gray-800 disabled:opacity-50 h-12 text-base overflow-hidden px-2"
          >
            <span className="whitespace-nowrap">
              {submitting
                ? "Submitting..."
                : cooldownSeconds > 0
                  ? `Wait ${cooldownSeconds}s`
                  : "SUBMIT"}
            </span>
          </Button>
          {message && (
            <div
              className={`font-poppins text-sm font-medium p-3 rounded ${
                message.includes("Correct") ||
                message.includes("Success") ||
                message.includes("🎉")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="bg-black text-white p-4 rounded-lg">
          <div className="font-whirlyBirdie font-bold text-lg mb-4 text-center">
            Your progress
          </div>
          <div className="grid grid-cols-3 gap-3">
            {dayBoxes.map(({ day }) => {
              const dayProgress = progress?.progress.find((p) => p.day === day);
              const isCompleted = dayProgress?.isCompleted;
              const isAvailable =
                dayProgress?.isAccessible === true &&
                dayProgress?.isDateUnlocked !== false;

              // Determine background color: completed > available > locked
              let bgColor = "bg-gray-400"; // default for locked
              let textColor = "text-white";

              if (isCompleted) {
                bgColor = "bg-[#d4c4b0]"; // beige for completed
                textColor = "text-black";
              } else if (isAvailable) {
                bgColor = "bg-white"; // white for available/unlocked
                textColor = "text-black";
              }

              return (
                <div key={day} className={`${bgColor} rounded p-3 text-center`}>
                  <div
                    className={`font-whirlyBirdie font-bold ${textColor} text-sm mb-1 whitespace-nowrap`}
                  >
                    day {day}
                  </div>
                  <div
                    className={`font-poppins font-medium ${textColor} text-xs`}
                  >
                    {isCompleted
                      ? "Completed"
                      : isAvailable
                        ? "In Progress"
                        : "Locked"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Final Congratulations Popup */}
      <AnimatePresence>
        {showFinalCongrats && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-2xl p-6 max-w-md w-full mx-4 text-center bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-4 tracking-wide">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-gray-200 leading-relaxed">
                You've completed all available challenges!
                <br />
                Absolute legend energy.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowFinalCongrats(false)}
                  className="px-6 py-2.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors border border-white/30"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <TutorialModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </motion.div>
  );
}

export default PlayPage;
