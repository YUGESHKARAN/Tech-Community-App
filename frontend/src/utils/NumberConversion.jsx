
const formatCount = (value) => {
  const num = Number(value);

  if (!Number.isFinite(num)) return "0";

  const abs = Math.abs(num);

  if (abs < 1000) return num.toString();

  if (abs < 1_000_000) {
    const formatted = (num / 1000).toFixed(abs >= 10_000 ? 0 : 1);
    return formatted.replace(/\.0$/, "") + "K";
  }

  if (abs < 1_000_000_000) {
    const formatted = (num / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1);
    return formatted.replace(/\.0$/, "") + "M";
  }

  if (abs < 1_000_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(abs >= 10_000_000_000 ? 0 : 1);
    return formatted.replace(/\.0$/, "") + "B";
  }

  const formatted = (num / 1_000_000_000_000).toFixed(1);
  return formatted.replace(/\.0$/, "") + "T";
};


export default formatCount ;