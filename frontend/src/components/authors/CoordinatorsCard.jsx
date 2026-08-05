import { useState } from "react";
import highlightText from "../../hooks/highlightText";
import axiosInstance from "../../instances/Axiosinstances";
import formatCount from "../../utils/NumberConversion";
import BadgeIcons from "../achievements/BadgeIcons";
import { TbBrain, TbBulb, TbChartDots, TbShieldLock, TbSparkles, TbWorldWww } from "react-icons/tb";
import { Link } from "react-router-dom";
import user from "../../images/user.png";

const domainStyle = {
  "AI/ML": { icon: TbBrain, from: "#0d9488", to: "#0f766e" },
  "Cyber Security": { icon: TbShieldLock, from: "#7c3aed", to: "#6d28d9" },
  "Data Science": { icon: TbChartDots, from: "#059669", to: "#047857" },
  GenAI: { icon: TbSparkles, from: "#ea580c", to: "#c2410c" },
  "Web Development": { icon: TbWorldWww, from: "#2563eb", to: "#1d4ed8" },
};
const defaultDomainStyle = { icon: TbBulb, from: "#0d9488", to: "#0f766e" };
const getDomainStyle = (name) => domainStyle[name] || defaultDomainStyle;

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const DomainTags = ({ communities = [] }) => {
    if (!communities.length) return null;
    return (
      <div className="flex gap-1.5 flex-wrap justify-center">
        {communities.slice(0, 2).map((c) => {
          const name = typeof c === "string" ? c : c.name;
          const style = getDomainStyle(name);
          return (
            <span
              key={name}
              className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: `${style.from}22`, color: style.from }}
            >
              {name}
            </span>
          );
        })}
      </div>
    );
  };



const CoordinatorsCard = ({ author }) => {
    return (
      <div className="theme border border-[#1e293b] rounded-xl md:rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
        <div className="pt-5 pb-10 md:pb-9 px-4 relative bg-white/[0.03] border-b border-emerald-500/20">
          {author.role === "coordinator" && (
            <span className="absolute top-3 right-3 text-[8px] md:text-[9px] md:font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-emerald-500/10 border border-emerald-700/40 text-emerald-400">
              Coordinator
            </span>
          )}
        </div>

        <Link to={`/viewProfile/${author.email}`} className="block px-4">
          <div className="relative -mt-8 mb-2 flex justify-center">
            <img
              src={
                author.profile
                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                  : user
              }
              className="md:w-16 w-14 h-14 md:h-16 rounded-full object-cover border-[3px] border-[#0f172a] bg-gray-700"
              alt={author.authorName}
            />
          </div>

          <div className="text-center mb-2">
            <h3 className="text-sm font-semibold text-white truncate">
              {/* {highlightText(author.authorName, debouncedSearch)} */}
              {author?.authorName}
            </h3>
            <p className="text-[10px] text-gray-400 truncate">
              {/* {highlightText(author.email, debouncedSearch)} */}
              {author?.email}
            </p>
          </div>

          {author?.badges?.length > 0 && (
            <div className="flex justify-center mb-2">
              <BadgeIcons
                badges={author.badges}
                parentClass="static -space-x-0"
                shieldClassName="w-4 h-4"
              />
            </div>
          )}

          {/* <div className="mb-3">
            <DomainTags communities={author.communities} />
          </div> */}

          <div className="flex justify-center gap-4 text-[10px] text-gray-400 pt-2 border-t border-white/5 mb-3">
            {author?.postCount > 0 && (
              <span>
                <b className="text-white">{formatCount(author.postCount)}</b>{" "}
                posts
              </span>
            )}
            <span>
              <b className="text-white">
                {formatCount(
                  author.followersCount ?? author.followers?.length ?? 0,
                )}
              </b>{" "}
              followers
            </span>
          </div>
        </Link>

       
      </div>
    );
  };

  export default CoordinatorsCard