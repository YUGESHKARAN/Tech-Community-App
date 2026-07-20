export  const avatarColor = (name) => {
    const colors = [
      "#10b981",
      "#1871ff",
      "#f59e0b",
      "#f6238c",
      "#8b5cf6",
      "#09b2d0",
      "#f97316",
    ];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  };

export  const initials = (name) => name?.slice(0, 2).toUpperCase() ?? "??";

