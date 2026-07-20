
import {
  TbBrain,
  TbShieldLock,
  TbChartDots,
  TbSparkles,
  TbWorldWww,
  TbBulb,
  TbTrophy,
  TbCrown,
  TbFlame,
  TbUsers,
  TbFileText,
  TbFlame as TbFlameFilter,
  TbClockHour4,
  TbSparkles as TbSparklesFilter,
} from "react-icons/tb";

export const FILTERS = [
  { value: "all", label: "All", color: "text-white" },
  {
    value: "trending",
    label: "Trending",
    icon: TbFlameFilter,
    color: "text-red-500",
  },
  {
    value: "active",
    label: "Most active",
    icon: TbClockHour4,
    color: "text-yellow-500",
  },
  {
    value: "newest",
    label: "Newest",
    icon: TbSparklesFilter,
    color: "text-blue-500",
  },
];