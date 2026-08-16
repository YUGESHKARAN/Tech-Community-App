import * as TbIcons from "react-icons/tb";
import {
  TbBrain,
  TbShieldLock,
  TbChartDots,
  TbSparkles,
  TbWorldWww,
  TbBulb,
  TbUsers,
  TbFileText,
  TbMessageCircle,
  TbUserCheck,
  TbChevronUp,
  TbPin,
  TbCircleCheck,
  TbTrophy,
  TbHash,
  TbPlus,
  TbEye,
  TbHeart,
  TbShare,
  TbBookmark,
  TbClock,
  TbHeartFilled,
} from "react-icons/tb";

const domainStyle = {
  "AI/ML": { icon: TbBrain, from: "#0d9488", to: "#0f766e" },
  "Cyber Security": { icon: TbShieldLock, from: "#7c3aed", to: "#6d28d9" },
  "Data Science": { icon: TbChartDots, from: "#059669", to: "#047857" },
  "GenAI": { icon: TbSparkles, from: "#ea580c", to: "#c2410c" },
  "Web Development": { icon: TbWorldWww, from: "#2563eb", to: "#1d4ed8" },
};
export const getDomainStyle = (name) =>
  domainStyle[name] || { icon: TbBulb, from: "#0d9488", to: "#0f766e" };
