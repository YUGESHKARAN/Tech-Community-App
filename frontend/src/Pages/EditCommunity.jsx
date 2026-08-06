import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as TbIcons from "react-icons/tb";
import NavBar from "../ui/NavBar";
import axiosInstance from "../instances/Axiosinstances";
import { getItem } from "../utils/encode";
import { ICON_SUBSET, ICON_CATEGORIES } from "../utils/tablerIconSubset";
import {
  TbArrowLeft, TbEye, TbEyeOff, TbCheck, TbX,
  TbSearch, TbPalette, TbChevronDown, TbUsers,
  TbFileText, TbUserCheck, TbMessageCircle,
  TbBrain, TbInfoCircle, TbAlertCircle,
} from "react-icons/tb";
import useGetSingleTechCommunity from "../hooks/SingleTechDomain/useGetSingleTechCommunity";
import useGetAllMembersByDomain from "../hooks/SingleTechDomain/useGetAllMembersByDomain";
import toast from "../components/toaster/Toast";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive a gradient pair from a single base hex color.
 * `from` = base, `to` = base darkened by 15% lightness in HSL.
 */
const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToHex = (h, s, l) => {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const deriveGradient = (baseHex) => {
  if (!baseHex || !/^#[0-9A-Fa-f]{6}$/.test(baseHex)) {
    return { from: "#0d9488", to: "#0f766e" };
  }
  const [h, s, l] = hexToHsl(baseHex);
  return {
    from: baseHex,
    to: hslToHex(h, Math.min(s + 5, 100), Math.max(l - 15, 5)),
  };
};

const isValidHex = (v) => /^#[0-9A-Fa-f]{6}$/.test(v);

// ── Sample initial data — replace with useGetCommunityById(communityId) ───────
// const INITIAL_COMMUNITY = {
//   _id: "66f1a2b3c4d5e6f7a8b9c0d1",
//   name: "AI/ML",
//   slug: "ai-ml",
//   tagline: "Connect, collaborate and grow together",
//   description:
//     "The AI/ML community is the space for machine learning practitioners, researchers, and enthusiasts to share knowledge, ask questions, and showcase projects.",
//   icon: "TbBrain",
//   colorTheme: "#0d9488",
//   memberCount: 14,
//   postCount: 8,
//   coordinatorsCount: 5,
// };

// ── Preset palette ────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  { label: "Teal",    hex: "#0d9488" },
  { label: "Emerald", hex: "#059669" },
  { label: "Blue",    hex: "#2563eb" },
  { label: "Violet",  hex: "#7c3aed" },
  { label: "Orange",  hex: "#ea580c" },
  { label: "Rose",    hex: "#e11d48" },
  { label: "Sky",     hex: "#0284c7" },
  { label: "Amber",   hex: "#d97706" },
  { label: "Fuchsia", hex: "#a21caf" },
  { label: "Lime",    hex: "#65a30d" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  ICON PICKER
// ─────────────────────────────────────────────────────────────────────────────
const IconPicker = ({ value, onChange, accentColor }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ICON_SUBSET.filter((icon) => {
      const matchesSearch = !q || icon.label.includes(q) || icon.key.toLowerCase().includes(q);
      const matchesCat = activeCategory === "All" || icon.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory]);

  return (
    <div className="theme border border-[#1e293b] rounded-xl overflow-hidden">
      {/* search + category row */}
      <div className="flex items-center gap-2 p-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2 flex-1 bg-white/5 rounded-lg px-3 py-1.5">
          <TbSearch className="text-gray-500 text-sm flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300">
              <TbX className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* category chips */}
      <div className="flex gap-1.5 flex-wrap px-3 py-2 border-b border-[#1e293b]">
        {["All", ...ICON_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[9px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
              activeCategory === cat
                ? "text-white border-white/20 bg-white/5"
                : "text-gray-500 border-white/5 hover:text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* icon grid */}
      <div className="grid grid-cols-8 gap-1 p-3 max-h-52 emerald-scrollbar overflow-x-hidden overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="col-span-8 text-center text-xs text-gray-500 py-6">
            No icons found for "{search}"
          </div>
        ) : (
          filtered.map(({ key, label }) => {
            const Icon = TbIcons[key];
            if (!Icon) return null;
            const isSelected = value === key;
            return (
              <button
                key={label}
                onClick={() => onChange(key)}
                title={label}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                  isSelected
                    ? "ring-2 scale-110"
                    : "hover:bg-white/5"
                }`}
                style={isSelected ? { ringColor: accentColor, background: `${accentColor}22` } : {}}
              >
                <Icon
                  className="text-base"
                  style={{ color: isSelected ? accentColor : undefined }}
                />
              </button>
            );
          })
        )}
      </div>

      {/* selected indicator */}
      {value && (
        <div
          className="flex items-center gap-2 px-3 py-2 border-t border-[#1e293b] text-[10px] text-gray-400"
          style={{ color: accentColor }}
        >
          {(() => {
            const Icon = TbIcons[value];
            return Icon ? <Icon className="text-sm" /> : null;
          })()}
          <span>{value} selected</span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  BANNER PREVIEW (used in both edit sidebar and full-screen preview)
// ─────────────────────────────────────────────────────────────────────────────
const BannerPreview = ({ form, gradient, userRole, community }) => {
  const Icon = TbIcons[form.icon] || TbBrain;
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,.4) 0%, transparent 60%)" }}
      />
      <div className="relative px-5 pt-6 pb-5">
        {userRole && (
          <span className="absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white capitalize">
            {userRole}
          </span>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon className="text-white text-xl" />
          </div>
          <div>
            {/* <p className="text-[10px] font-medium tracking-widest uppercase text-white/60 mb-0.5">
              Tech Domain · BytesBase
            </p> */}
            <h1 className="text-xl md:text-2xl font-semibold text-white leading-tight">
              {form.name || "Community name"}
            </h1>
            {form.tagline && (
          <p className="text-xs text-white/70 max-w-md leading-relaxed mb-4">
            {form.tagline}
          </p>
        )}
          </div>
        </div>

        <p className="text-xs text-white font-semibold line-clamp-2 max-w-2xl leading-relaxed md:mb-2 mb-1">
            {form.description}
          </p>
        
        <div className="flex flex-wrap gap-2 md:gap-3">
          {[
            { Icon: TbUsers,          val: community.memberCount,      label: "members" },
            { Icon: TbFileText,       val: community.postCount,        label: "posts" },
            { Icon: TbMessageCircle,  val: 0,                          label: "discussions" },
            { Icon: TbUserCheck,      val: community.coordinatorsCount,label: "coordinators" },
          ].map(({ Icon: Si, val, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-white/80">
              <Si className="text-sm text-white/60" />
              <b className="text-white font-semibold">{val}</b> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
function EditCommunity() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const {
    coordinators,
    loading: membersLoading,
    hasFetched: coordinatorsLoaded,
    fetchAuthors,
  } = useGetAllMembersByDomain(communityId);

  const currentUserEmail = getItem("email");
  const currentUserRole = getItem("role");
  const isAdmin = currentUserRole === "admin" || currentUserRole === "director";
  const isCoordinator = coordinators.some((coord) => coord?.email === currentUserEmail);
  // const hasEditAccess = isAdmin || isCoordinator;
  const hasEditAccess = true;
  const isLoadingAccessData = membersLoading && !coordinatorsLoaded;

  // console.log("coordinators", coordinators)
  // console.log("isCoordinator", isCoordinator)

  // ── State ─────────────────────────────────────────────────────────────────
  // Replace with useGetCommunityById(communityId)
  // const [community] = useState(INITIAL_COMMUNITY);
  const {
    communityDetails: community,
    commLoading,
  } = useGetSingleTechCommunity(communityId);

  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    icon: "TbBrain",
    colorTheme: "#0d9488",
  });

  useEffect(() => {
    if (community) {
      setForm({
        name: community.name || "",
        tagline: community.tagline || "",
        description: community.description || "",
        icon: community.icon || "TbBrain",
        colorTheme: community.colorTheme || "#0d9488",
      });
      setHexInput(community.colorTheme || "#0d9488");
    }
  }, [community]);

  useEffect(() => {
    if (communityId) {
      fetchAuthors();
    }
  }, [communityId, fetchAuthors]);

  useEffect(() => {
    if (!membersLoading && !hasEditAccess && communityId) {
      navigate(`/tecCommunityDetails/${communityId}`);
    }
  }, [communityId, hasEditAccess, isLoadingAccessData, navigate]);

  const [hexInput, setHexInput] = useState("#0d9488");
  const [hexError, setHexError] = useState("");

  const gradient = useMemo(() => deriveGradient(form.colorTheme), [form.colorTheme]);

  // Escape key closes preview
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && preview) setPreview(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [preview]);

  // Sync hex input with color picker
  useEffect(() => { setHexInput(form.colorTheme); }, [form.colorTheme]);

  const set = useCallback((field) => (val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  }, []);

  const handleColorSelect = (hex) => {
    set("colorTheme")(hex);
    setHexInput(hex);
    setHexError("");
  };

  const handleHexInput = (raw) => {
    setHexInput(raw);
    if (isValidHex(raw)) {
      set("colorTheme")(raw);
      setHexError("");
    } else {
      setHexError("Enter a valid 6-digit hex e.g. #0d9488");
    }
  };

  const isDirty = useMemo(() => {
    return (
      form.name        !== community?.name        ||
      form.tagline     !== (community?.tagline     || "") ||
      form.description !== (community?.description || "") ||
      form.icon        !== (community?.icon        || "TbBrain") ||
      form.colorTheme  !== (community?.colorTheme  || "#0d9488")
    );
  }, [form, community, communityId]);

  const handleSave = async () => {
    if (!hasEditAccess) {
      toast.error("Access denied", "You are not allowed to edit this community.");
      return;
    }

    setSaveError("");
    if (!form.name.trim()) {
      setSaveError("Community name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      // Replace with your real endpoint once wired:
      // PATCH /api/communities/:communityId
      const res = await axiosInstance.put(`/blog/techCommunity/${communityId}`, {
        name:        isAdmin ? form.name.trim() : undefined,
        tagline:     form.tagline.trim(),
        description: form.description.trim(),
        icon:        form.icon,
        colorTheme:  form.colorTheme,
      });

      if (res.status===200)
      {
        setSaved(true);
        toast.success('Updated Successfully', 'Community updated successfully !')
        setTimeout(() => setSaved(false), 2500);
        navigate(`/tecCommunityDetails/${communityId}`);
      }

      
    } catch (err) {
      
      setSaveError(err?.response?.data?.message || "Save failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  

  // ─────────────────────────────────────────────────────────────────────────
  //  FULL-SCREEN PREVIEW MODE
  // ─────────────────────────────────────────────────────────────────────────
  if (preview) {
    return (
      <div className="min-h-screen  md:width-max theme text-white">
        {/* Preview toolbar */}
        <div className="sticky top-0 z-50 max-w-[1400px] mx-auto flex items-center justify-between px-5 py-3 theme border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: gradient.from }}
            />
            <span className="text-sm font-medium text-gray-200">
              Preview — {form.name}
            </span>
            <span className="text-[10px] text-gray-500 hidden md:block">
              Press Esc to exit
            </span>
          </div>
          <button
            onClick={() => setPreview(false)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            <TbEyeOff className="text-sm" /> Back to edit
          </button>
        </div>

        {/* Preview content */}
        <div className="px-4 md:px-8 max-w-[1400px] mx-auto pt-6 pb-20">
          <BannerPreview
            form={form}
            gradient={gradient}
            userRole={currentUserRole}
            community={community}
          />

          {/* Tab bar preview */}
          {/* <div className="flex border-b border-white/5 mt-4 mb-6">
            {["Feed", "Discussions", "Members"].map((tab, i) => (
              <div
                key={tab}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  i === 0
                    ? "border-white text-white"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab}
              </div>
            ))}
          </div> */}

          {/* placeholder content */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-white/[0.02] rounded-xl border border-[#1e293b] animate-pulse" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-48 bg-white/[0.02] rounded-xl border border-[#1e293b] animate-pulse" />
              <div className="h-32 bg-white/[0.02] rounded-xl border border-[#1e293b] animate-pulse" />
            </div>
          </div> */}

          {/* description card */}
        
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  EDIT MODE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen theme text-white flex flex-col">
      <NavBar />

      <div className="flex-grow px-4 md:px-8 max-w-[1200px] mx-auto w-full pb-20 pt-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/tecCommunityDetails/${communityId}`}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <TbArrowLeft className="text-sm" />
              Back
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <h1 className="text-base font-semibold text-gray-200">
              Edit community
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
            >
              <TbEye className="text-sm" /> Preview
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: isDirty && !loading ? gradient.from : undefined }}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <><TbCheck className="text-sm" /> Saved</>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            <TbAlertCircle className="text-sm flex-shrink-0" />
            {saveError}
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">

          {/* ── Left: form fields ── */}
          <div className="flex flex-col gap-6">

            {/* Community name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Community name
                </label>
                {!isAdmin && (
                  <span className="flex items-center gap-1 text-[9px] text-amber-400">
                    <TbInfoCircle className="text-[10px]" />
                    Only admins can change the name
                  </span>
                )}
              </div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                disabled={!isAdmin}
                placeholder="e.g. AI/ML"
                className="w-full bg-white/[0.03] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Tagline
                <span className="text-gray-600 font-normal ml-1">— short descriptor under the title</span>
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => set("tagline")(e.target.value)}
                maxLength={100}
                placeholder="e.g. Connect, collaborate and grow together"
                className="w-full bg-white/[0.03] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-1 text-right">
                {form.tagline.length}/100
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Description
                <span className="text-gray-600 font-normal ml-1">— shown in the About section</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="What is this community about? Who is it for?"
                className="w-full bg-white/[0.03] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 resize-none transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-1 text-right">
                {form.description.length}/500
              </p>
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Community icon
              </label>
              <IconPicker
                value={form.icon}
                onChange={set("icon")}
                accentColor={gradient.from}
              />
            </div>

            {/* Color theme */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-3">
                <TbPalette className="text-sm" style={{ color: gradient.from }} />
                Color theme
              </label>

              {/* Preset swatches */}
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_COLORS.map(({ label, hex }) => (
                  <button
                    key={hex}
                    onClick={() => handleColorSelect(hex)}
                    title={label}
                    className="relative w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                    style={{ background: hex }}
                  >
                    {form.colorTheme === hex && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <TbCheck className="text-white text-xs drop-shadow" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom hex input + native color picker */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-[#1e293b] rounded-xl px-3 py-2 flex-1 focus-within:border-white/20 transition-colors">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ background: isValidHex(hexInput) ? hexInput : "#444" }}
                  />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexInput(e.target.value)}
                    placeholder="#0d9488"
                    maxLength={7}
                    className="bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none flex-1 font-mono"
                  />
                </div>

                {/* Native color picker — hidden, triggered by the swatch */}
                <label className="cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white/10 overflow-hidden flex-shrink-0"
                    style={{ background: form.colorTheme }}
                  />
                  <input
                    type="color"
                    value={form.colorTheme}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

              {hexError && (
                <p className="text-[10px] text-red-400 mt-1.5">{hexError}</p>
              )}

              {/* Gradient preview strip */}
              <div
                className="mt-3 h-2 rounded-full"
                style={{ background: `linear-gradient(to right, ${gradient.from}, ${gradient.to})` }}
              />
              <p className="text-[10px] text-gray-600 mt-1">
                Auto-derived gradient: {gradient.from} → {gradient.to}
              </p>
            </div>

          </div>

          {/* ── Right: live banner preview ── */}
          <div className="lg:sticky lg:top-6 flex flex-col gap-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Live preview
            </p>
            <BannerPreview
              form={form}
              gradient={gradient}
              userRole={currentUserRole}
              community={community}
            />

            {/* Mini icon + color summary */}
            <div className="theme border border-[#1e293b] rounded-xl p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${gradient.from}22` }}
              >
                {(() => {
                  const Icon = TbIcons[form.icon] || TbBrain;
                  return <Icon className="text-xl" style={{ color: gradient.from }} />;
                })()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-200 truncate">
                  {form.name || "Community name"}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {form.tagline || "No tagline yet"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setPreview(true)}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
            >
              <TbEye className="text-sm" />
              Full-screen preview
            </button>

            {isDirty && (
              <p className="text-[10px] text-amber-400 text-center">
                You have unsaved changes
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default EditCommunity;