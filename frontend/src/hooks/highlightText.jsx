// const escapeRegExp = (string) => {
//   return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// };

// const highlightText = (text, query) => {
//   if (!query || !text) return text;

//   const escapedQuery = escapeRegExp(query);

//   const regex = new RegExp(`(${escapedQuery})`, "gi");
//   const parts = text.split(regex);

//   return parts.map((part, i) =>
//     part.toLowerCase() === query.toLowerCase() ? (
//       <span key={i} className="text-teal-500 font-semibold">
//         {part}
//       </span>
//     ) : (
//       part
//     )
//   );
// };

// export default highlightText;


const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const highlightText = (text, query) => {
  if (!query || !text) return text;

  const escapedQuery = escapeRegExp(query);

  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="text-teal-500 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default highlightText;