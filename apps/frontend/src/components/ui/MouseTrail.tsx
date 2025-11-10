import { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const trailRef = useRef<HTMLDivElement>(null);
  const points = useRef<{ x: number; y: number; size: number }[]>([]);
  const animationFrameId = useRef<number>();
  const lastPointRef = useRef({ x: 0, y: 0 });
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    if (!trailRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Use pageX/pageY instead of clientX/clientY for better cross-page consistency
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
        // Use pageX/pageY for touch events as well
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

  return (
    <div
      ref={trailRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999]"
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        // Ensure the trail appears above all other content
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        // Make sure it's above modals and other high-z-index elements
        zIndex: 9999,
      }}
    />
  );
};

export default MouseTrail;
