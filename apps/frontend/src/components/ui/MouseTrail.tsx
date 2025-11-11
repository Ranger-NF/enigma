import { useEffect, useRef, useState } from 'react';

const MouseTrail = () => {
  const trailRef = useRef<HTMLDivElement>(null);
  const points = useRef<{ x: number; y: number; size: number }[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    if (!trailRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Use pageX/pageY for consistent positioning
      const x = e.pageX;
      const y = e.pageY;
      
      // Add a new point at the mouse position
      points.current.push({
        x,
        y,
        size: isMobile ? 14 : 16, // Larger for better visibility
      });

      // Keep even more points for a much longer trail
      if (points.current.length > 40) { // Doubled from 20 to 40 for much longer tail
        points.current.shift();
      }
      
      lastPointRef.current = { x, y };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Use pageX/pageY for consistent positioning
        const x = e.touches[0].pageX;
        const y = e.touches[0].pageY;
        
        points.current.push({
          x,
          y,
          size: 12,
        });

        if (points.current.length > 10) {
          points.current.shift();
        }
        
        lastPointRef.current = { x, y };
      }
    };

    const animate = () => {
      const trail = trailRef.current;
      if (!trail) return;

      // Fade out and remove old points even more gradually
      points.current = points.current
        .map((point, i) => ({
          ...point,
          // Slower fade for a much smoother trail
          size: point.size * 0.92, // Increased from 0.9 for even slower fade
        }))
        .filter((point) => point.size > 0.2); // Keep even smaller points

      // Update the trail element
      trail.innerHTML = points.current
        .map(
          (point, i) =>
            `<div class="absolute rounded-full bg-gradient-to-r from-slate-100 to-slate-300 opacity-80" 
                  style="width: ${point.size}px; 
                         height: ${point.size}px; 
                         left: ${point.x - point.size / 2}px; 
                         top: ${point.y - point.size / 2}px;
                         transform: scale(${0.8 + (i / points.current.length) * 0.7});
                         filter: blur(${Math.min(point.size * 0.25, 1.5)}px);
                         transition: all 0.08s ease-out;
                         will-change: transform, opacity;">
             </div>`
        )
        .join('');

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameId.current = requestAnimationFrame(animate);

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isMobile]);

  // Add scroll position to the points calculation
  const getScrollPosition = () => ({
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset,
  });

  // Get the full document height
  const getDocumentHeight = () => {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  };

  const [documentSize, setDocumentSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? getDocumentHeight() : 0,
  });

  // Update document size on resize and scroll
  useEffect(() => {
    const updateSize = () => {
      setDocumentSize({
        width: window.innerWidth,
        height: getDocumentHeight(),
      });
    };

    // Initial size
    updateSize();

    // Add event listeners
    window.addEventListener('resize', updateSize);
    window.addEventListener('scroll', updateSize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('scroll', updateSize);
    };
  }, []);

  return (
    <div
      ref={trailRef}
      className="pointer-events-none z-[9999]"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${documentSize.height}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'transform',
        transform: 'translateZ(0)', // Force hardware acceleration
      }}
    />
  );
};

export default MouseTrail;
