// useDragSheet.js
import { useRef } from "react";

const useDragSheet = (setViewComments) => {
  const sheetRef = useRef(null);

  const handleDragStart = (e) => {
    const startY = e.touches ? e.touches[0].clientY : e.clientY;

    const onMove = (moveEvent) => {
      const currentY = moveEvent.touches
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;
      const delta = currentY - startY;
     
      
  // Collapse comments when sheet is dragged below 35vh
  
      // Close when dragged down by 60px
      if (delta > 60) {
        setViewComments(false);
        onEnd();
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
