import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

function RenderTextNoMarkdown({ text, className = "" }) {
  if (!text) return null;

  // Convert escaped line breaks into spaces
  const cleanedText = text
    .replace(/\\r\\n|\\n|\\r\n/g, " ")

    // Remove markdown/special symbols
    .replace(/[#*_~`>\-\[\]\(\)!]/g, "")

    // Remove multiple spaces
    .replace(/\s+/g, " ")
    .trim();

  return (
    <span
      className={twMerge(
        clsx(
          ` block
         
          min-w-0
         
        
          break-words
          text-wap
          whitespace-normal
          line-clamp-2
          text-xs
         
          text-gray-400`,
          className
        )
      )}
    >
      {cleanedText}
    </span>
  );
}

export default RenderTextNoMarkdown;