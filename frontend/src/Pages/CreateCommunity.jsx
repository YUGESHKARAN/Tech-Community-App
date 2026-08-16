import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as TbIcons from "react-icons/tb";
import NavBar from "../ui/NavBar";
import axiosInstance from "../instances/Axiosinstances";
import { getItem } from "../utils/encode";
import { ICON_SUBSET, ICON_CATEGORIES } from "../utils/tablerIconSubset";
import {
  TbArrowLeft, TbSearch, TbX, TbCheck, TbPalette,
  TbAlertCircle, TbBrain, TbUsers, TbFileText,
  TbUserCheck, TbMessageCircle, TbPlus,
} from "react-icons/tb";

// ── Helpers (same as EditCommunity) ───────────────────────────────────────────
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
    to:   hslToHex(h, Math.min(s + 5, 100), Math.max(l - 15, 5)),
  };
};

const isValidHex = (v) => /^#[0-9A-Fa-f]{6}$/.test(v);

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

// ── Icon picker (same as EditCommunity) ───────────────────────────────────────
const IconPicker = ({ value, onChange, accentColor }) => {
  const [search, setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ICON_SUBSET.filter((icon) => {
      const matchesSearch  = !q || icon.label.includes(q) || icon.key.toLowerCase().includes(q);
      const matchesCat     = activeCategory === "All" || icon.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory]);

  return (
    <div className="theme border border-[#1e293b] rounded-xl overflow-hidden">
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

      <div className="flex gap-1.5 flex-wrap px-3 py-2 border-b border-[#1e293b]">
        {["All", ...ICON_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
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

      <div className="grid grid-cols-8 gap-1 p-3 max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="col-span-8 text-center text-xs text-gray-500 py-6">
            No icons found for "{search}"
          </div>
        ) : (
          filtered.map(({ key, label }) => {
            const Icon       = TbIcons[key];
            if (!Icon) return null;
            const isSelected = value === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                title={label}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                  isSelected ? "ring-2 scale-110" : "hover:bg-white/5"
                }`}
                style={isSelected ? { background: `${accentColor}22` } : {}}
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

      {value && (
        <div
          className="flex items-center gap-2 px-3 py-2 border-t border-[#1e293b] text-[10px]"
          style={{ color: accentColor }}
        >
          {(() => { const Icon = TbIcons[value]; return Icon ? <Icon className="text-sm" /> : null; })()}
          <span>{value} selected</span>
        </div>
      )}
    </div>
  );
};

// ── Banner preview ────────────────────────────────────────────────────────────
const BannerPreview = ({ form, gradient }) => {
  const Icon = TbIcons[form.icon] || TbBrain;
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,.4) 0%, transparent 60%)" }}
      />
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon className="text-white text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-widest uppercase text-white/60 mb-0.5">
              Tech Domain · BytesBase
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-white leading-tight">
              {form.name || "Community name"}
            </h1>
          </div>
        </div>
        {form.tagline && (
          <p className="text-xs text-white/70 max-w-md leading-relaxed mb-4">
            {form.tagline}
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          {[
            { Icon: TbUsers,         val: 0, label: "members" },
            { Icon: TbFileText,      val: 0, label: "posts" },
            { Icon: TbMessageCircle, val: 0, label: "discussions" },
            { Icon: TbUserCheck,     val: 0, label: "coordinators" },
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
function CreateCommunity() {
  const navigate  = useNavigate();
  const role      = getItem("role");

  // ── client-side guard ─────────────────────────────────────────────────────
  useEffect(() => {
    if (role !== "admin" && role !== "director") {
      navigate("/community", { replace: true });
    }
  }, [role, navigate]);

  // ── form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:        "",
    tagline:     "",
    description: "",
    icon:        "TbBulb",
    colorTheme:  "#0d9488",
  });

  const [hexInput,   setHexInput]   = useState(form.colorTheme);
  const [hexError,   setHexError]   = useState("");
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const gradient = useMemo(() => deriveGradient(form.colorTheme), [form.colorTheme]);

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: val }));

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

  const validate = () => {
    const e = {};
    if (!form.name.trim())               e.name = "Community name is required.";
    if (form.name.trim().length > 100)   e.name = "Name must be under 100 characters.";
    if (form.tagline.length > 120)       e.tagline = "Tagline must be under 120 characters.";
    if (form.description.length > 500)   e.description = "Description must be under 500 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await axiosInstance.post("/api/communities", {
        name:        form.name.trim(),
        tagline:     form.tagline.trim(),
        description: form.description.trim(),
        icon:        form.icon,
        colorTheme:  form.colorTheme,
      });

      const newCommunityId = res.data.community._id;
      navigate(`/community/${newCommunityId}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create community. Try again.";
      // 409 = duplicate name
      if (err?.response?.status === 409) {
        setErrors({ name: msg });
      } else {
        setErrors({ submit: msg });
      }
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen theme text-white flex flex-col">
      <NavBar />

      <div className="flex-grow px-4 md:px-8 max-w-[1200px] mx-auto w-full pb-20 pt-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/techCommunityDetails"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            <TbArrowLeft className="text-sm" /> Back to communities
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <h1 className="text-base font-semibold text-gray-200">
            Create new community
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">

            {/* ── Left: form fields ── */}
            <div className="flex flex-col gap-6">

              {/* submit error */}
              {errors.submit && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  <TbAlertCircle className="text-sm flex-shrink-0" />
                  {errors.submit}
                </div>
              )}

              {/* name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Community name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name")(e.target.value)}
                  placeholder="e.g. AI/ML, Cyber Security, GenAI"
                  maxLength={100}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${
                    errors.name ? "border-red-500/40" : "border-[#1e293b]"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.name ? (
                    <p className="text-[10px] text-red-400 flex items-center gap-1">
                      <TbAlertCircle className="text-xs" /> {errors.name}
                    </p>
                  ) : <span />}
                  <p className="text-[10px] text-gray-600">{form.name.length}/100</p>
                </div>
              </div>

              {/* tagline */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Tagline
                  <span className="text-gray-600 font-normal ml-1">— short descriptor shown under the banner title</span>
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => set("tagline")(e.target.value)}
                  placeholder="e.g. Connect, collaborate and grow together"
                  maxLength={120}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${
                    errors.tagline ? "border-red-500/40" : "border-[#1e293b]"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.tagline ? (
                    <p className="text-[10px] text-red-400">{errors.tagline}</p>
                  ) : <span />}
                  <p className="text-[10px] text-gray-600">{form.tagline.length}/120</p>
                </div>
              </div>

              {/* description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Description
                  <span className="text-gray-600 font-normal ml-1">— shown in the About section of the community page</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description")(e.target.value)}
                  placeholder="What is this community about? Who should join?"
                  maxLength={500}
                  rows={4}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 resize-none transition-colors ${
                    errors.description ? "border-red-500/40" : "border-[#1e293b]"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.description ? (
                    <p className="text-[10px] text-red-400">{errors.description}</p>
                  ) : <span />}
                  <p className="text-[10px] text-gray-600">{form.description.length}/500</p>
                </div>
              </div>

              {/* icon picker */}
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

              {/* color theme */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-3">
                  <TbPalette className="text-sm" style={{ color: gradient.from }} />
                  Color theme
                </label>

                {/* presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {PRESET_COLORS.map(({ label, hex }) => (
                    <button
                      key={hex}
                      type="button"
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

                {/* hex input + native picker */}
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

                {/* gradient strip */}
                <div
                  className="mt-3 h-2 rounded-full"
                  style={{ background: `linear-gradient(to right, ${gradient.from}, ${gradient.to})` }}
                />
                <p className="text-[10px] text-gray-600 mt-1">
                  Auto-derived gradient: {gradient.from} → {gradient.to}
                </p>
              </div>

              {/* actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <Link
                  to="/techCommunityDetails"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || !form.name.trim()}
                  className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: form.name.trim() && !submitting
                      ? gradient.from
                      : undefined,
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <TbPlus className="text-sm" />
                      Create community
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* ── Right: sticky live preview ── */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Live preview
              </p>

              <BannerPreview form={form} gradient={gradient} />

              {/* mini card summary */}
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

              {/* how it looks on the landing card */}
              <div className="theme border border-[#1e293b] rounded-xl overflow-hidden">
                <div
                  className="px-4 pt-4 pb-3 flex items-center gap-3 relative"
                  style={{
                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const Icon = TbIcons[form.icon] || TbBrain;
                      return <Icon className="text-white text-base" />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm truncate">
                      {form.name || "Community name"}
                    </div>
                    <div className="text-white/70 text-[10px]">Tech Domain</div>
                  </div>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2">
                  <div className="flex gap-4 text-[10px] text-gray-400">
                    <span><b className="text-gray-200">0</b> members</span>
                    <span><b className="text-gray-200">0</b> posts</span>
                  </div>
                  <p className="text-[9px] text-gray-600 italic">
                    How it appears on the landing page
                  </p>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCommunity;