import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../instances/Axiosinstances";
import { getItem } from "../../utils/encode";
import {
  TbShield, TbUserShield, TbPlus, TbPencil, TbTrash,
  TbCheck, TbX, TbAlertCircle, TbLoader2, TbRefresh,
  TbDots, TbAt, TbToggleLeft, TbToggleRight,
  TbKey, TbArrowLeft, TbCrown, TbEye, TbUser,
  TbChevronDown, TbChevronUp, TbBuilding,
} from "react-icons/tb";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const BASE = "/bytes/directorTeam";

const ROLES = [
  { value: "super_director",   label: "Super Director",    icon: TbCrown,       color: "text-amber-400",   bg: "bg-amber-500/10"   },
  { value: "director",         label: "Director",          icon: TbUserShield,  color: "text-violet-400",  bg: "bg-violet-500/10"  },
  { value: "readonly_director",label: "Read-only Director",icon: TbEye,         color: "text-blue-400",    bg: "bg-blue-500/10"    },
];

const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.value, r]));

// mirror of server-side PERMISSIONS constant
const PERMISSIONS = {
  VIEW_TENANTS:        "view_tenants",
  CREATE_TENANT:       "create_tenant",
  UPDATE_TENANT:       "update_tenant",
  DELETE_TENANT:       "delete_tenant",
  TOGGLE_TENANT:       "toggle_tenant",
  BULK_ACTION:         "bulk_action",
  VIEW_HEALTH:         "view_health",
  UPDATE_USAGE_LIMIT:  "update_usage_limit",
  IMPERSONATE:         "impersonate",
  VIEW_AUDIT_LOG:      "view_audit_log",
  VIEW_ALL_AUDIT_LOGS: "view_all_audit_logs",
  VIEW_DIRECTORS:      "view_directors",
  CREATE_DIRECTOR:     "create_director",
  UPDATE_DIRECTOR:     "update_director",
  DELETE_DIRECTOR:     "delete_director",
};

const PERMISSION_GROUPS = [
  {
    label: "Tenant management",
    perms: [
      { key: PERMISSIONS.VIEW_TENANTS,       label: "View tenants"        },
      { key: PERMISSIONS.CREATE_TENANT,      label: "Create tenant"       },
      { key: PERMISSIONS.UPDATE_TENANT,      label: "Update tenant"       },
      { key: PERMISSIONS.DELETE_TENANT,      label: "Delete tenant"       },
      { key: PERMISSIONS.TOGGLE_TENANT,      label: "Activate / deactivate" },
      { key: PERMISSIONS.BULK_ACTION,        label: "Bulk actions"        },
    ],
  },
  {
    label: "Health & usage",
    perms: [
      { key: PERMISSIONS.VIEW_HEALTH,        label: "View health stats"   },
      { key: PERMISSIONS.UPDATE_USAGE_LIMIT, label: "Update usage limits" },
    ],
  },
  {
    label: "Impersonation",
    perms: [
      { key: PERMISSIONS.IMPERSONATE,        label: "Impersonate tenants" },
    ],
  },
  {
    label: "Audit log",
    perms: [
      { key: PERMISSIONS.VIEW_AUDIT_LOG,      label: "View audit log (own)"    },
      { key: PERMISSIONS.VIEW_ALL_AUDIT_LOGS, label: "View all audit logs"      },
    ],
  },
  {
    label: "Director management",
    perms: [
      { key: PERMISSIONS.VIEW_DIRECTORS,     label: "View directors"      },
      { key: PERMISSIONS.CREATE_DIRECTOR,    label: "Create director"     },
      { key: PERMISSIONS.UPDATE_DIRECTOR,    label: "Update director"     },
      { key: PERMISSIONS.DELETE_DIRECTOR,    label: "Delete director"     },
    ],
  },
];

const ROLE_DEFAULT_PERMS = {
  super_director:    Object.values(PERMISSIONS),
  director:          [
    "view_tenants","create_tenant","update_tenant","toggle_tenant","bulk_action",
    "view_health","update_usage_limit","impersonate","view_audit_log",
  ],
  readonly_director: ["view_tenants","view_health","view_audit_log"],
};

// ─────────────────────────────────────────────────────────────────────────────
//  SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const r = ROLE_MAP[role];
  if (!r) return null;
  const Icon = r.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${r.bg} ${r.color}`}>
      <Icon className="text-[10px]" /> {r.label}
    </span>
  );
};

const ActiveBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
    active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
  }`}>
    <span className={`w-1 h-1 rounded-full ${active ? "bg-emerald-400" : "bg-red-400"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

const FieldError = ({ msg }) => msg ? (
  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
    <TbAlertCircle className="text-xs flex-shrink-0" /> {msg}
  </p>
) : null;

const OverflowMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
        <TbDots className="text-base" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl py-1">
          {items.map((item) => (
            <button key={item.label} onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors ${item.danger ? "text-red-400" : "text-gray-300"}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE-OVER
// ─────────────────────────────────────────────────────────────────────────────
const SlideOver = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-[#0a0f1a] border-l border-[#1e293b] flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 0.2s cubic-bezier(0.32,0.72,0,1)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] flex-shrink-0">
          <h2 className="md:text-sm text-xs font-semibold text-gray-200">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-white/5">
            <TbX className="text-base" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  PERMISSION EDITOR
// ─────────────────────────────────────────────────────────────────────────────
const PermissionEditor = ({ permissions, onChange }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (group) => setExpanded((p) => ({ ...p, [group]: !p[group] }));
  const has  = (perm) => permissions.includes(perm);
  const flip = (perm) => {
    const next = has(perm)
      ? permissions.filter((p) => p !== perm)
      : [...permissions, perm];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.label} className="border border-[#1e293b] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggle(group.label)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/5 transition-colors"
          >
            {group.label}
            {expanded[group.label] ? <TbChevronUp className="text-sm" /> : <TbChevronDown className="text-sm" />}
          </button>
          {expanded[group.label] && (
            <div className="border-t border-[#1e293b] px-4 py-3 flex flex-col gap-2">
              {group.perms.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => flip(key)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      has(key) ? "bg-emerald-600 border-emerald-600" : "border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {has(key) && <TbCheck className="text-white text-[10px]" />}
                  </div>
                  <span className="text-xs text-gray-300">{label}</span>
                  <code className="text-[9px] text-gray-600 ml-auto">{key}</code>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  DIRECTOR FORM
// ─────────────────────────────────────────────────────────────────────────────
const DirectorForm = ({ initial, onSubmit, onCancel, submitting, submitLabel, isSelf }) => {
  const [form, setForm] = useState({
    name:        initial?.name        || "",
    email:       initial?.email       || "",
    password:    "",
    role:        initial?.role        || "director",
    permissions: initial?.permissions || ROLE_DEFAULT_PERMS["director"],
    active:      initial?.active      !== undefined ? initial.active : true,
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));

  // when role changes, reset permissions to defaults
  const handleRoleChange = (role) => {
    setForm((p) => ({ ...p, role, permissions: ROLE_DEFAULT_PERMS[role] || [] }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name  = "Name is required";
    if (!initial && !form.email.trim()) e.email = "Email is required";
    if (!initial && !form.email.endsWith("@bytesbase.tech"))
      e.email = "Email must end with @bytesbase.tech";
    if (!initial && !form.password.trim()) e.password = "Password is required";
    if (!initial && form.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* name */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Full name <span className="text-red-400">*</span>
        </label>
        <input type="text" value={form.name} onChange={(e) => set("name")(e.target.value)}
          placeholder="e.g. Ravi Kumar"
          className={`w-full bg-white/[0.03] border rounded-lg md:rounded-xl px-3 md:py-2 py-1.5 text-xs md:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${errors.name ? "border-red-500/40" : "border-[#1e293b]"}`} />
        <FieldError msg={errors.name} />
      </div>

      {/* email — only on create */}
      {!initial && (
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <TbAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input type="email" value={form.email}
              onChange={(e) => set("email")(e.target.value.toLowerCase())}
              placeholder="ravi@bytesbase.tech"
              className={`w-full bg-white/[0.03] border rounded-lg md:rounded-xl pl-8 pr-3 md:py-2 py-1.5 text-xs md:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${errors.email ? "border-red-500/40" : "border-[#1e293b]"}`} />
          </div>
          <FieldError msg={errors.email} />
        </div>
      )}

      {/* password — only on create */}
      {!initial && (
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Password <span className="text-red-400">*</span>
          </label>
          <input type="password" value={form.password} onChange={(e) => set("password")(e.target.value)}
            placeholder="Min 8 characters"
            className={`w-full bg-white/[0.03] border rounded-lg md:rounded-xl px-3 md:py-2 py-1.5 text-xs md:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${errors.password ? "border-red-500/40" : "border-[#1e293b]"}`} />
          <FieldError msg={errors.password} />
        </div>
      )}

      {/* role */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Role</label>
        <div className="flex flex-col gap-2">
          {ROLES.map(({ value, label, icon: Icon, color, bg }) => (
            <label key={value}
              className={`flex items-center gap-3 px-4 py-1.5 md:py-2.5 border rounded-lg md:rounded-xl cursor-pointer transition-colors ${
                form.role === value ? "border-white/20 bg-white/5" : "border-[#1e293b] hover:border-white/10"
              } ${isSelf ? "opacity-40 cursor-not-allowed" : ""}`}>
              <input type="radio" name="role" value={value} checked={form.role === value}
                onChange={() => !isSelf && handleRoleChange(value)} className="sr-only" />
              <div className={`md:w-7 w-6 h-6 md:h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`md:text-sm text-xs ${color}`} />
              </div>
              <span className="text-xs font-medium text-gray-200">{label}</span>
              {form.role === value && <TbCheck className="text-emerald-400 text-sm ml-auto" />}
            </label>
          ))}
        </div>
        {isSelf && <p className="text-[9px] text-gray-600 mt-1">You cannot change your own role</p>}
      </div>

      {/* active toggle — only on edit */}
      {initial && (
        <label className={`flex items-center gap-2 cursor-pointer select-none ${isSelf ? "opacity-40 cursor-not-allowed" : ""}`}>
          <div onClick={() => !isSelf && set("active")(!form.active)}
            className={`relative w-8 h-4 rounded-full transition-colors ${form.active ? "bg-emerald-600" : "bg-white/10"}`}>
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${form.active ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-xs text-gray-300">Account active</span>
          {isSelf && <span className="text-[9px] text-gray-600">— cannot deactivate yourself</span>}
        </label>
      )}

      {/* permissions */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Permissions
          <span className="text-gray-600 font-normal normal-case tracking-normal ml-2">
            — auto-set from role, customise below
          </span>
        </label>
        <PermissionEditor permissions={form.permissions} onChange={set("permissions")} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button type="button" onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-500 transition-colors">
          {submitting ? <><TbLoader2 className="animate-spin text-sm" /> Saving...</> : <><TbCheck className="text-sm" /> {submitLabel}</>}
        </button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  DIRECTOR CARD
// ─────────────────────────────────────────────────────────────────────────────
const DirectorCard = ({ director, currentId, isSuperDirector, onEdit, onDelete, onToggleActive }) => {
  const isSelf = director._id === currentId;

  const menuItems = [
    { label: "Edit",   icon: <TbPencil className="text-sm" />, onClick: () => onEdit(director) },
    ...(!isSelf ? [
      {
        label: director.active ? "Deactivate" : "Activate",
        icon: director.active ? <TbToggleLeft className="text-sm" /> : <TbToggleRight className="text-sm text-emerald-400" />,
        onClick: () => onToggleActive(director),
      },
      { label: "Delete", icon: <TbTrash className="text-sm" />, onClick: () => onDelete(director), danger: true },
    ] : []),
  ];

  return (
    <div className={`bg-[#0a0f1a] border rounded-xl p-4 flex flex-col gap-3 transition-all ${
      isSelf ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-[#1e293b] hover:border-white/10"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start md:items-center gap-3 min-w-0">
          <div className="md:w-9 md:h-9 w-7 h-7 rounded-lg md:rounded-xl bg-white/5 border border-[#1e293b] flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-400 uppercase">
            {director.name?.[0] || "?"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="md:text-sm text-xs font-semibold text-gray-200 truncate">{director.name}</h3>
              {isSelf && <span className="text-[9px] text-emerald-400 font-medium">(you)</span>}
            </div>
            <p className="text-[10px] text-gray-500 truncate">{director.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ActiveBadge active={director.active} />
          {isSuperDirector && <OverflowMenu items={menuItems} />}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <RoleBadge role={director.role} />
        <span className="text-[9px] text-gray-600">
          {director.permissions?.length || 0} permissions
        </span>
      </div>

      <div className="flex flex-col gap-1 pt-2 border-t border-white/[0.04] text-[9px] text-gray-600">
        {director.lastLoginAt ? (
          <span>Last login: {new Date(director.lastLoginAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        ) : (
          <span>Never logged in</span>
        )}
        {director.createdBy && (
          <span>Added by: {director.createdBy.name || director.createdBy.email}</span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
function DirectorTeamPage() {
  const navigate = useNavigate();
  const role     = getItem("role");
  const email    = getItem("email");

  const isSuperDirector = role === "super_director";
  const isDirectorRole  = ["super_director", "director", "readonly_director"].includes(role);

  useEffect(() => {
    if (!isDirectorRole) navigate("/", { replace: true });
  }, [isDirectorRole, navigate]);

  const [directors,  setDirectors]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [slideOver,  setSlideOver]  = useState(null); // null | 'create' | director obj
  const [delTarget,  setDelTarget]  = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchDirectors = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await axiosInstance.get(BASE);
      setDirectors(res.data.directors || []);
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load directors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDirectors(); }, [fetchDirectors]);

  const currentDirector = directors.find((d) => d.email === email);
  const currentId       = currentDirector?._id;

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(BASE, form);
      setDirectors((prev) => [...prev, res.data.director]);
      setSlideOver(null);
      showToast(`${res.data.director.name} added to the team`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create director", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!slideOver || slideOver === "create") return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`${BASE}/${slideOver._id}`, form);
      setDirectors((prev) => prev.map((d) => d._id === slideOver._id ? res.data.director : d));
      setSlideOver(null);
      showToast(`${res.data.director.name} updated`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update director", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (director) => {
    try {
      const res = await axiosInstance.put(`${BASE}/${director._id}`, { active: !director.active });
      setDirectors((prev) => prev.map((d) => d._id === director._id ? res.data.director : d));
      showToast(res.data.director.active ? `${director.name} activated` : `${director.name} deactivated`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update", "error");
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`${BASE}/${delTarget._id}`);
      setDirectors((prev) => prev.filter((d) => d._id !== delTarget._id));
      setDelTarget(null);
      showToast(`${delTarget.name} removed from the team`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete director", "error");
    } finally {
      setDeleting(false);
    }
  };

  const roleCounts = directors.reduce((acc, d) => {
    acc[d.role] = (acc[d.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#060b14] text-white">
      {/* top bar */}
      <div className="sticky top-0 z-30  max-w-[1200px] mx-auto bg-[#060b14]/90 backdrop-blur border-b border-[#1e293b] px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-3">
          <button onClick={() => navigate("/director")}
            className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <TbArrowLeft className="md:text-base text-sm" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <TbUserShield className="text-violet-400 text-sm" />
          </div>
          <span className="md:text-sm text-[10px] font-semibold text-gray-200">Director team</span>
          <span className="text-[10px] text-gray-600">·</span>
          <span className="text-[10px] text-gray-500">{directors.length} members</span>
        </div>
        {isSuperDirector && (
          <button onClick={() => setSlideOver("create")}
            className="flex items-center gap-1.5 text-xs font-semibold px-2 md:px-3 py-1.5 rounded-lg md:rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors">
            <TbPlus className="md:text-sm text-xs" /> <span className="hidden sm:block">Add director</span>
          </button>
        )}
      </div>

      <div className="md:px-6 px-3 py-6 max-w-[1200px] mx-auto">
        {/* stats */}
        {!loading && !fetchError && (
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
            {ROLES.map(({ value, label, icon: Icon, color, bg }) => (
              <div key={value} className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg md:rounded-xl md:px-4 px-2.5 py-1.5 md:py-3 flex-col md:flex md:flex-row items-center gap-3">
                <div className={`md:w-8 w-6 h-6 md:h-8 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`text-sm md:text-base ${color}`} />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs md:text-lg font-bold text-gray-200">{roleCounts[value] || 0}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <TbLoader2 className="text-2xl text-violet-400 animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <TbAlertCircle className="text-3xl text-red-400" />
            <p className="text-sm text-gray-400">{fetchError}</p>
            <button onClick={fetchDirectors} className="text-xs text-violet-400 hover:text-violet-300">Try again</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {directors.map((director) => (
              <DirectorCard
                key={director._id}
                director={director}
                currentId={currentId}
                isSuperDirector={isSuperDirector}
                onEdit={(d) => setSlideOver(d)}
                onDelete={(d) => setDelTarget(d)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* create slide-over */}
      <SlideOver open={slideOver === "create"} onClose={() => setSlideOver(null)} title="Add director">
        <DirectorForm
          onSubmit={handleCreate}
          onCancel={() => setSlideOver(null)}
          submitting={submitting}
          submitLabel="Add director"
        />
      </SlideOver>

      {/* edit slide-over */}
      <SlideOver open={typeof slideOver === "object" && slideOver !== null} onClose={() => setSlideOver(null)}
        title={`Edit - ${slideOver?.name || ""}`}>
        {typeof slideOver === "object" && slideOver !== null && (
          <DirectorForm
            initial={slideOver}
            isSelf={slideOver._id === currentId}
            onSubmit={handleUpdate}
            onCancel={() => setSlideOver(null)}
            submitting={submitting}
            submitLabel="Save changes"
          />
        )}
      </SlideOver>

      {/* delete confirm */}
      {delTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TbAlertCircle className="text-red-400 text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200">Remove director</h3>
                <p className="text-[10px] text-gray-500">This cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Remove <b className="text-gray-200">{delTarget.name}</b> ({delTarget.email}) from the director team?
              They will immediately lose all platform access.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)} disabled={deleting}
                className="flex-1 py-2 text-xs font-medium text-gray-400 border border-[#1e293b] rounded-xl hover:border-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {deleting ? <><TbLoader2 className="animate-spin text-sm" /> Removing...</> : "Remove director"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl border ${
          toast.type === "error"
            ? "bg-red-900/80 border-red-500/30 text-red-200"
            : "bg-violet-900/80 border-violet-500/30 text-violet-200"
        }`}>
          {toast.type === "error" ? <TbAlertCircle className="text-sm" /> : <TbCheck className="text-sm" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default DirectorTeamPage;