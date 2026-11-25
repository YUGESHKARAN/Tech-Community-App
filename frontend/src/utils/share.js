export function shareExcerpt(text) {
  const excerpt = (text || "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/(^|\s)#{1,6}\s+/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return excerpt.length > 200 ? `${excerpt.slice(0, 199).trimEnd()}…` : excerpt;
}

export async function shareData(data) {
  if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
    await navigator.share(data);
    return "shared";
  }

  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard is unavailable.");
  }
  await navigator.clipboard.writeText(data.url);
  return "copied";
}
