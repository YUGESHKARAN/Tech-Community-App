import React from "react";

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
      className={`text-xs  line-clamp-2  md:line-clamp-2  text-gray-400 break-words ${className}`}
    >
      {cleanedText}
    </span>
  );
}

export default RenderTextNoMarkdown;