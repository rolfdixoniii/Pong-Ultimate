import { useEffect, useState } from "react";
import { useTouchControls } from "@/lib/stores/useTouchControls";
import { usePong } from "@/lib/stores/usePong";

export function TouchControls() {
  const { setMovingUp, setMovingDown } = useTouchControls();
  const { phase } = usePong();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || 
                  'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile || phase !== "playing") {
    return null;
  }

  const handleTouchStart = (direction: "up" | "down") => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (direction === "up") {
      setMovingUp(true);
    } else {
      setMovingDown(true);
    }
  };

  const handleTouchEnd = (direction: "up" | "down") => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (direction === "up") {
      setMovingUp(false);
    } else {
      setMovingDown(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 flex flex-col gap-3 pointer-events-none z-50">
      <button
        onTouchStart={handleTouchStart("up")}
        onTouchEnd={handleTouchEnd("up")}
        onMouseDown={handleTouchStart("up")}
        onMouseUp={handleTouchEnd("up")}
        onMouseLeave={handleTouchEnd("up")}
        className="w-20 h-20 bg-cyan-600/80 active:bg-cyan-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold select-none touch-none pointer-events-auto"
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
      >
        ▲
      </button>
      <button
        onTouchStart={handleTouchStart("down")}
        onTouchEnd={handleTouchEnd("down")}
        onMouseDown={handleTouchStart("down")}
        onMouseUp={handleTouchEnd("down")}
        onMouseLeave={handleTouchEnd("down")}
        className="w-20 h-20 bg-cyan-600/80 active:bg-cyan-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold select-none touch-none pointer-events-auto"
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
      >
        ▼
      </button>
    </div>
  );
}
