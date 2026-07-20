
export const getLast3MonthsName = () => {
    const now = new Date();

    const formatMonth = (offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);

      const month = d.toLocaleString("default", { month: "short" }); // May
      const year = String(d.getFullYear()); // 26

      return `${month} ${year}`;
    };

    return {
      current_month: formatMonth(0),
      previous_month: formatMonth(1),
      two_months_ago: formatMonth(2),
    };
  };

