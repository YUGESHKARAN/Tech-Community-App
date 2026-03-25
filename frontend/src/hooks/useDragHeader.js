// useDragSheet.js
import { useRef } from "react";

const useDragSheet = (setViewComments) => {
  const sheetRef = useRef(null);

  const handleDragStart = (e) => {
    const startY = e.touches ? e.touches[0].clientY : e.clientY;
    const startHeight = sheetRef.current.offsetHeight;

    const onMove = (moveEvent) => {
      const currentY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const delta = currentY - startY;
      const newHeight = Math.min(Math.max(startHeight - delta, 100), window.innerHeight * 0.9);
      sheetRef.current.style.height = `${newHeight}px`;

      // Collapse comments when sheet is dragged below 35vh
      if (newHeight < window.innerHeight * 0.35) {
        setViewComments(false);
        sheetRef.current.style.height = "";

      }
    };
    

    const onEnd = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchend", onEnd);
  };

  return { sheetRef, handleDragStart };
};

export default useDragSheet;