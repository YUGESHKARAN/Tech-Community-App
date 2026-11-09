import { NavLink } from "react-router-dom";
import {
  TbAward,
  TbCalendarEvent,
  TbGavel,
  TbBuilding,
  TbHistory,
  TbMail,
  TbSettings,
  TbUser,
  TbUsers,
} from "react-icons/tb";
import useEventsViewer from "../../hooks/event/useEventsViewer";

// `needs` hides a section unless the viewer has that role.
const SECTIONS = [
  {
    title: "Events",
    items: [{ to: "/events", label: "Browse events", icon: TbCalendarEvent }],
  },
  {
    title: "My events",
    items: [
      { to: "/events/my", label: "Registered", icon: TbUser },
      { to: "/events/my/teams", label: "My teams", icon: TbUsers },
      { to: "/events/my/invites", label: "Invitations", icon: TbMail },
      { to: "/events/my/past", label: "Past events", icon: TbHistory },
    ],
  },
  {
    title: "Judging & results",
    needs: "canJudge",
    items: [
      { to: "/events/judging", label: "Judging queue", icon: TbGavel },
      { to: "/events/results", label: "Results", icon: TbAward },
    ],
  },
  {
    title: "Organizer",
    needs: "isOrganizer",
    items: [
      { to: "/manage/events", label: "Manage events", icon: TbSettings },
      { to: "/manage/partners", label: "Partners", icon: TbBuilding },
    ],
  },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-emerald-500/10 text-emerald-300"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
  }`;

/**
 * Events navigation. Shown beside the page on desktop and in a drawer on mobile.
 * `onNavigate` lets the drawer close after a link is tapped.
 */
export default function EventSidebar({ onNavigate }) {
  const viewer = useEventsViewer();
  const sections = SECTIONS.filter((s) => !s.needs || viewer[s.needs]);

  return (
    <nav aria-label="Events" className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink to={item.to} end className={linkClass} onClick={onNavigate}>
                    <Icon size={16} aria-hidden />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}