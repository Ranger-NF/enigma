import React from "react";
import { createPortal } from "react-dom";

interface QuestionImageProps {
  src?: string;
  imageLoaded: boolean;
  setImageLoaded: (value: boolean) => void;
}

const QuestionImage: React.FC<QuestionImageProps> = ({ src, imageLoaded, setImageLoaded }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleClick = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  return (
    <>
      {/* Normal Image */}
      <img
        src={src}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(true)}
        onClick={handleClick}
        className={`w-full h-full object-contain cursor-pointer transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        alt="Question illustration"
      />

      {/* Fullscreen Overlay (in portal) */}
      {isFullscreen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]"
            onClick={closeFullscreen}
          >
            <img
              src={src}
              alt={src ? "Full view" : "No image available "}
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl font-bold"
              onClick={closeFullscreen}
            >
              ✕
            </button>
          </div>,
          document.body
        )}
    </>
  );
};

export default QuestionImage;
