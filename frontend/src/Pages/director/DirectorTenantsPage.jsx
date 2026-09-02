import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../instances/Axiosinstances";
import { getItem } from "../../utils/encode";
import {
  TbBuilding, TbPlus, TbSearch, TbDots, TbPencil, TbTrash,
  TbCheck, TbX, TbAlertCircle, TbLoader2, TbRefresh,
  TbToggleLeft, TbToggleRight, TbWorld, TbAt, TbUsers,
  TbShield, TbExternalLink, TbBuildingSkyscraper,
  TbActivity, TbChartBar, TbHistory, TbUserShield,
  TbCheckbox, TbSquare, TbAlertTriangle, TbEye,
  TbClipboardList, TbLogout, TbInfoCircle,
} from "react-icons/tb";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const BASE = "/bytes/director";
const ADVANCED_BASE = "/bytes/directorAdvanced";

const EMPTY_FORM = {
  tenantId:    "",
  name:        "",
  emailDomain: "",
  subdomain:   "",
  active:      true,
  config: {
    allowPublicProfiles: false,
    maxUsersAllowed:     10000,
    customBranding:      false,
  },
};

const AUDIT_ACTION_LABELS = {
  "tenant.create":             "Created tenant",
  "tenant.update":             "Updated tenant",
  "tenant.delete":             "Deleted tenant",
  "tenant.update_usage_limit": "Updated usage limit",
  "tenant.bulk_activate":      "Bulk activated",
  "tenant.bulk_deactivate":    "Bulk deactivated",
  "tenant.impersonate":        "Started impersonation",
  "tenant.impersonation_revoked": "Revoked impersonation",
};

// ─────────────────────────────────────────────────────────────────────────────
//  SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const Badge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
    active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
  }`}>
    <span className={`w-1 h-1 rounded-full ${active ? "bg-emerald-400" : "bg-red-400"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

const AlertBadge = ({ level }) => {
  if (!level || level === "none") return null;
  const map = {
    warning:  { cls: "bg-amber-500/10 text-amber-400",  label: "⚠ Warning" },
    critical: { cls: "bg-red-500/10 text-red-400",      label: "🔴 Critical" },
    exceeded: { cls: "bg-red-600/20 text-red-300",      label: "❗ Exceeded" },
  };
  const { cls, label } = map[level] || {};
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
};

const FieldError = ({ msg }) => msg ? (
  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
    <TbAlertCircle className="text-xs flex-shrink-0" /> {msg}
  </p>
) : null;

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-8 h-4 rounded-full transition-colors ${checked ? "bg-emerald-600" : "bg-white/10"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </div>
    <span className="text-xs text-gray-300">{label}</span>
  </label>
);

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
        <div className="absolute right-0 top-8 z-50 w-48 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl py-1 overflow-hidden">
          {items.map((item) => (
            <button key={item.label} onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-white/5 ${item.danger ? "text-red-400" : "text-gray-300"}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE-OVER PANEL
// ─────────────────────────────────────────────────────────────────────────────
const SlideOver = ({ open, onClose, title, children, width = "max-w-xl" }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full ${width} bg-[#0a0f1a] border-l border-[#1e293b] flex flex-col shadow-2xl`}
        style={{ animation: "slideInRight 0.2s cubic-bezier(0.32,0.72,0,1)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-white/5 transition-colors">
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
//  DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({ tenant, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <TbAlertCircle className="text-red-400 text-xl" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Delete tenant</h3>
          <p className="text-[10px] text-gray-500">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
        You are about to permanently delete{" "}
        <b className="text-gray-200">{tenant.name}</b> (
        <code className="text-emerald-400">{tenant.tenantId}</code>).
        User data will remain in the database but this tenant record will be removed.
      </p>
      <div className="flex items-center gap-3">
        <button onClick={onCancel} disabled={deleting}
          className="flex-1 py-2 text-xs font-medium text-gray-400 border border-[#1e293b] rounded-xl hover:border-white/10 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
          {deleting ? <><TbLoader2 className="animate-spin text-sm" /> Deleting...</> : "Delete tenant"}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  TENANT FORM
// ─────────────────────────────────────────────────────────────────────────────
const TenantForm = ({ initial, onSubmit, onCancel, submitting, submitLabel }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));
  const setConfig = (field) => (val) => setForm((p) => ({ ...p, config: { ...p.config, [field]: val } }));

  const validate = () => {
    const e = {};
    if (!form.tenantId.trim())    e.tenantId    = "Tenant ID is required";
    if (!/^[a-z0-9_-]+$/.test(form.tenantId.trim()))
      e.tenantId = "Only lowercase letters, numbers, hyphens and underscores";
    if (!form.name.trim())        e.name        = "Institution name is required";
    if (!form.emailDomain.trim()) e.emailDomain = "Email domain is required";
    if (!/^[\w.-]+\.[a-z]{2,}$/.test(form.emailDomain.trim()))
      e.emailDomain = "Enter a valid domain e.g. dsuniversity.ac.in";
    if (form.config.maxUsersAllowed < 1) e.maxUsersAllowed = "Must be at least 1";
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Tenant ID <span className="text-red-400">*</span>
          </label>
          <input type="text" value={form.tenantId}
            onChange={(e) => set("tenantId")(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            placeholder="e.g. dsu" disabled={!!initial}
            className={`w-full bg-white/[0.03] border rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${errors.tenantId ? "border-red-500/40" : "border-[#1e293b]"}`} />
          {initial && <p className="text-[9px] text-gray-600 mt-1">Tenant ID cannot be changed</p>}
          <FieldError msg={errors.tenantId} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Institution name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="e.g. Dr. Sivanthi Aditanar University"
            className={`w-full bg-white/[0.03] border rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${errors.name ? "border-red-500/40" : "border-[#1e293b]"}`} />
          <FieldError msg={errors.name} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Email domain <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <TbAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input type="text" value={form.emailDomain}
              onChange={(e) => set("emailDomain")(e.target.value.toLowerCase())}
              placeholder="dsuniversity.ac.in"
              className={`w-full bg-white/[0.03] border rounded-xl pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${errors.emailDomain ? "border-red-500/40" : "border-[#1e293b]"}`} />
          </div>
          <FieldError msg={errors.emailDomain} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Subdomain <span className="text-gray-600 font-normal normal-case tracking-normal">— optional</span>
          </label>
          <div className="relative">
            <TbWorld className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input type="text" value={form.subdomain}
              onChange={(e) => set("subdomain")(e.target.value.toLowerCase())}
              placeholder="dsu → dsu.bytesbase.me"
              className="w-full bg-white/[0.03] border border-[#1e293b] rounded-xl pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors" />
          </div>
        </div>
      </div>
      <Toggle checked={form.active} onChange={set("active")} label="Tenant active" />
      <div className="border border-[#1e293b] rounded-xl p-4 flex flex-col gap-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Configuration</p>
        <div className="flex flex-col gap-3">
          <Toggle checked={form.config.allowPublicProfiles} onChange={setConfig("allowPublicProfiles")} label="Allow public profiles" />
          <Toggle checked={form.config.customBranding} onChange={setConfig("customBranding")} label="Custom branding" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Max users allowed</label>
          <input type="number" min={1} value={form.config.maxUsersAllowed}
            onChange={(e) => setConfig("maxUsersAllowed")(Number(e.target.value))}
            className={`w-40 bg-white/[0.03] border rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-white/20 transition-colors ${errors.maxUsersAllowed ? "border-red-500/40" : "border-[#1e293b]"}`} />
          <FieldError msg={errors.maxUsersAllowed} />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button type="button" onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
        <button type="submit" disabled={submitting}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-500 transition-colors">
          {submitting ? <><TbLoader2 className="animate-spin text-sm" /> Saving...</> : <><TbCheck className="text-sm" /> {submitLabel}</>}
        </button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  HEALTH PANEL (lazy loaded per tenant)
// ─────────────────────────────────────────────────────────────────────────────
const HealthPanel = ({ tenantId }) => {
  const [health,  setHealth]  = useState(null);
  const [usage,   setUsage]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get(`${ADVANCED_BASE}/tenants/${tenantId}/health`),
      axiosInstance.get(`${ADVANCED_BASE}/tenants/${tenantId}/usage`),
    ])
      .then(([h, u]) => { setHealth(h.data.health); setUsage(u.data.usage); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <div className="flex items-center justify-center py-8"><TbLoader2 className="animate-spin text-emerald-400" /></div>;

  return (
    <div className="flex flex-col gap-4">
      {/* usage bar */}
      {usage && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">User capacity</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">{usage.current} / {usage.max}</span>
              <AlertBadge level={usage.alert} />
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              usage.alert === "exceeded" ? "bg-red-500" :
              usage.alert === "critical" ? "bg-red-400" :
              usage.alert === "warning"  ? "bg-amber-400" : "bg-emerald-500"
            }`} style={{ width: `${Math.min(usage.percentage, 100)}%` }} />
          </div>
          <p className="text-[9px] text-gray-600 mt-1">{usage.message}</p>
        </div>
      )}

      {/* health stats */}
      {health && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Users",        val: health.totalUsers },
            { label: "Posts",        val: health.totalPosts },
            { label: "Communities",  val: health.totalCommunities },
            { label: "Discussions",  val: health.totalDiscussions },
            { label: "Playlists",    val: health.totalPlaylists },
            { label: "Active / 30d", val: health.activeUsersLast30Days },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/[0.02] border border-[#1e293b] rounded-lg px-3 py-2">
              <p className="text-base font-bold text-gray-200">{val ?? "—"}</p>
              <p className="text-[9px] text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] text-gray-700 text-right">
        Fetched at {health ? new Date(health.fetchedAt).toLocaleTimeString() : "—"}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  AUDIT LOG PANEL
// ─────────────────────────────────────────────────────────────────────────────
const AuditLogPanel = () => {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState({ tenantId: "", action: "" });

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (filter.tenantId) params.set("tenantId", filter.tenantId);
      if (filter.action)   params.set("action",   filter.action);
      const res = await axiosInstance.get(`${ADVANCED_BASE}/audit-log?${params}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchLogs(1); }, [filter]);

  return (
    <div className="flex flex-col gap-4">
      {/* filters */}
      <div className="flex gap-2 flex-wrap">
        <input type="text" placeholder="Filter by tenant ID..." value={filter.tenantId}
          onChange={(e) => setFilter((p) => ({ ...p, tenantId: e.target.value }))}
          className="bg-white/[0.03] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/15 w-44" />
        <select value={filter.action} onChange={(e) => setFilter((p) => ({ ...p, action: e.target.value }))}
          className="theme border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-white/15">
          <option value="">All actions</option>
          {Object.entries(AUDIT_ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button onClick={() => fetchLogs(page)} className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <TbRefresh className={`text-sm ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><TbLoader2 className="animate-spin text-emerald-400" /></div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-10">No audit records found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <div key={log._id} className="bg-white/[0.02] border border-[#1e293b] rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-semibold text-emerald-400">
                  {AUDIT_ACTION_LABELS[log.action] || log.action}
                </span>
                <span className="text-[9px] text-gray-600 flex-shrink-0">
                  {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
                {log.targetTenantId && <span>Tenant: <code className="text-gray-400">{log.targetTenantId}</code></span>}
                {log.targetTenantIds?.length > 0 && <span>Tenants: <code className="text-gray-400">{log.targetTenantIds.join(", ")}</code></span>}
                <span>By: <span className="text-gray-400">{log.performedBy?.email}</span></span>
              </div>
              {log.meta && (
                <p className="text-[9px] text-gray-700 mt-1 truncate">
                  {JSON.stringify(log.meta)}
                </p>
              )}
            </div>
          ))}

          {/* pagination */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-gray-600">{total} total records</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => fetchLogs(page - 1)}
                className="text-[10px] px-2.5 py-1 rounded-lg border border-[#1e293b] text-gray-400 disabled:opacity-30 hover:bg-white/5 transition-colors">
                Prev
              </button>
              <button disabled={page * 20 >= total} onClick={() => fetchLogs(page + 1)}
                className="text-[10px] px-2.5 py-1 rounded-lg border border-[#1e293b] text-gray-400 disabled:opacity-30 hover:bg-white/5 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  IMPERSONATION PANEL
// ─────────────────────────────────────────────────────────────────────────────
const ImpersonationPanel = ({ tenant, onClose, showToast }) => {
  const [token,     setToken]     = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [jti,       setJti]       = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [revoking,  setRevoking]  = useState(false);

  const handleImpersonate = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(`${ADVANCED_BASE}/tenants/${tenant.tenantId}/impersonate`);
      setToken(res.data.token);
      setExpiresAt(res.data.expiresAt);
      // extract jti from token payload
      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      setJti(payload.jti);
      showToast(`Impersonation token issued for ${tenant.name}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to issue impersonation token", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!jti) return;
    setRevoking(true);
    try {
      await axiosInstance.post(`${ADVANCED_BASE}/impersonation/revoke`, { jti });
      setToken(null);
      setJti(null);
      setExpiresAt(null);
      showToast("Impersonation token revoked");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to revoke token", "error");
    } finally {
      setRevoking(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    showToast("Token copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <TbAlertTriangle className="text-amber-400 text-lg flex-shrink-0" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          Impersonation tokens grant admin-level access to{" "}
          <b>{tenant.name}</b> for 15 minutes. All actions are audit-logged.
        </p>
      </div>

      {!token ? (
        <button onClick={handleImpersonate} disabled={loading || !tenant.active}
          className="flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-40">
          {loading ? <><TbLoader2 className="animate-spin text-sm" /> Issuing...</> : <><TbUserShield className="text-sm" /> Issue impersonation token</>}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Token</label>
            <div className="bg-white/[0.02] border border-[#1e293b] rounded-xl p-3 font-mono text-[9px] text-gray-400 break-all leading-relaxed max-h-24 overflow-y-auto">
              {token}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Expires: <b className="text-gray-300">{new Date(expiresAt).toLocaleTimeString()}</b></span>
            <span>JTI: <code className="text-emerald-400">{jti?.slice(0, 8)}...</code></span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopyToken}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl bg-white/5 border border-[#1e293b] text-gray-300 hover:bg-white/8 transition-colors">
              <TbClipboardList className="text-sm" /> Copy token
            </button>
            <button onClick={handleRevoke} disabled={revoking}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl bg-red-600/20 border border-red-500/20 text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-40">
              {revoking ? <><TbLoader2 className="animate-spin text-sm" /> Revoking...</> : <><TbLogout className="text-sm" /> Revoke</>}
            </button>
          </div>
          <p className="text-[9px] text-gray-600 text-center">
            Use this token as the Authorization Bearer header when accessing the platform as this tenant's admin.
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TENANT CARD
// ─────────────────────────────────────────────────────────────────────────────
const TenantCard = ({ tenant, selected, onSelect, onEdit, onDelete, onToggleActive, onViewHealth, onImpersonate }) => {
  const menuItems = [
    { label: "Edit",             icon: <TbPencil className="text-sm" />,      onClick: () => onEdit(tenant) },
    { label: "Health & usage",   icon: <TbActivity className="text-sm" />,    onClick: () => onViewHealth(tenant) },
    { label: "Impersonate",      icon: <TbUserShield className="text-sm" />,  onClick: () => onImpersonate(tenant) },
    {
      label: tenant.active ? "Deactivate" : "Activate",
      icon: tenant.active ? <TbToggleLeft className="text-sm" /> : <TbToggleRight className="text-sm text-emerald-400" />,
      onClick: () => onToggleActive(tenant),
    },
    { label: "Delete", icon: <TbTrash className="text-sm" />, onClick: () => onDelete(tenant), danger: true },
  ];

  return (
    <div className={`bg-[#0a0f1a] border rounded-xl p-4 transition-all duration-200 flex flex-col gap-3 ${
      selected ? "border-emerald-500/40 bg-emerald-500/[0.03]" : "border-[#1e293b] hover:border-white/10"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {/* bulk select checkbox */}
          <button onClick={(e) => { e.stopPropagation(); onSelect(tenant.tenantId); }}
            className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
            {selected ? <TbCheckbox className="text-emerald-400 text-base" /> : <TbSquare className="text-base" />}
          </button>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <TbBuildingSkyscraper className="text-emerald-400 text-base" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs md:text-sm font-semibold text-gray-200 w-11/12 text-wrap truncate">{tenant.name}</h3>
            <code className="text-[10px] text-emerald-400/70">{tenant.tenantId}</code>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge active={tenant.active} />
          <OverflowMenu items={menuItems} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <TbAt className="text-xs text-gray-600 flex-shrink-0" />
          <span className="truncate">{tenant.emailDomain}</span>
        </div>
        {tenant.subdomain && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <TbWorld className="text-xs text-gray-600 flex-shrink-0" />
            <span>{tenant.subdomain}</span>
            <TbExternalLink className="text-[10px] text-gray-600" />
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-[#1e293b] text-gray-500">
          {tenant.config?.maxUsersAllowed?.toLocaleString() || "10,000"} users max
        </span>
        {tenant.config?.allowPublicProfiles && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400">Public profiles</span>
        )}
        {tenant.config?.customBranding && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400">Custom branding</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
        <span className="text-[9px] text-gray-600">
          Created {new Date(tenant.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <button onClick={() => onViewHealth(tenant)}
          className="text-[9px] text-emerald-500/60 hover:text-emerald-400 flex items-center gap-1 transition-colors">
          <TbActivity className="text-[10px]" /> View health
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  STATS BAR
// ─────────────────────────────────────────────────────────────────────────────
const StatsBar = ({ tenants }) => {
  const total    = tenants.length;
  const active   = tenants.filter((t) =>  t.active).length;
  const inactive = total - active;
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: "Total tenants", value: total,    icon: TbBuilding,     color: "text-gray-300"   },
        { label: "Active",        value: active,   icon: TbToggleRight,  color: "text-emerald-400" },
        { label: "Inactive",      value: inactive, icon: TbToggleLeft,   color: "text-red-400"    },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-[#0a0f1a] border border-[#1e293b] rounded-xl px-2 md:px-4 md:py-3 py-1 flex items-start md:items-center gap-3">
          <Icon className={`text-xl ${color}`} />
          <div className="flex flex-col items-center md:block">
            <p className="md:text-lg text-xs font-semibold md:font-bold text-gray-200">{value}</p>
            <p className="text-[10px] text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
function DirectorTenantsPage() {
  const navigate = useNavigate();
  const role     = getItem("role");

  useEffect(() => {
    if (role !== "admin") navigate("/", { replace: true });
  }, [role, navigate]);

  // ── data state ─────────────────────────────────────────────────────────────
  const [tenants,    setTenants]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── ui state ───────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("all");
  const [activeTab,    setActiveTab]    = useState("tenants"); // "tenants" | "audit"
  const [slideOver,    setSlideOver]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [healthTarget, setHealthTarget] = useState(null);
  const [impersonateTarget, setImpersonateTarget] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState(null);

  // ── bulk selection ─────────────────────────────────────────────────────────
  const [selected,       setSelected]       = useState(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await axiosInstance.get(`${BASE}/tenants`);
      setTenants(res.data.tenants || []);
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const visible = useMemo(() => {
    let list = tenants;
    if (filter === "active")   list = list.filter((t) =>  t.active);
    if (filter === "inactive") list = list.filter((t) => !t.active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.tenantId.toLowerCase().includes(q) ||
        t.emailDomain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tenants, filter, search]);

  // ── bulk selection helpers ─────────────────────────────────────────────────
  const toggleSelect = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const selectAll = () => setSelected(new Set(visible.map((t) => t.tenantId)));
  const clearAll  = () => setSelected(new Set());

  // ── bulk action ────────────────────────────────────────────────────────────
  const handleBulkAction = async (action) => {
    if (selected.size === 0) return;
    setBulkSubmitting(true);
    try {
      const res = await axiosInstance.post(`${ADVANCED_BASE}/tenants/bulk-action`, {
        action,
        tenantIds: [...selected],
      });
      showToast(`Bulk ${action}: ${res.data.modified} tenant(s) updated`);
      setSelected(new Set());
      fetchTenants();
    } catch (err) {
      showToast(err?.response?.data?.message || `Bulk ${action} failed`, "error");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`${BASE}/tenants`, form);
      setTenants((prev) => [res.data.tenant, ...prev]);
      setSlideOver(null);
      showToast(`${res.data.tenant.name} created successfully`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create tenant", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (form) => {
    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`${BASE}/tenants/${form.tenantId}`, form);
      setTenants((prev) => prev.map((t) => t.tenantId === form.tenantId ? res.data.tenant : t));
      setSlideOver(null);
      showToast(`${res.data.tenant.name} updated`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update tenant", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (tenant) => {
    try {
      const res = await axiosInstance.put(`${BASE}/tenants/${tenant.tenantId}`, { active: !tenant.active });
      setTenants((prev) => prev.map((t) => t.tenantId === tenant.tenantId ? res.data.tenant : t));
      showToast(res.data.tenant.active ? `${tenant.name} activated` : `${tenant.name} deactivated`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update tenant", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`${BASE}/tenants/${deleteTarget.tenantId}`);
      setTenants((prev) => prev.filter((t) => t.tenantId !== deleteTarget.tenantId));
      setDeleteTarget(null);
      showToast(`${deleteTarget.name} deleted`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete tenant", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060b14] text-white">

      {/* ── top bar ── */}
      <div className="sticky top-0 z-30 bg-[#060b14]/90 backdrop-blur border-b border-[#1e293b] px-2 md:px-6 py-3 flex items-center justify-evenly md:justify-between md:gap-4">
        <div className="flex  items-center gap-0.5 md:gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <TbShield className="text-emerald-400 text-sm" />
          </div>
          <span className="md:text-sm text-xs font-semibold text-gray-200">Director console</span>
          <span className="text-[10px] text-gray-600">·</span>

          {/* tab switcher */}
          <div className="flex gap-0.5 md:gap-1">
            {[
              { id: "tenants", label: "Tenants",   icon: TbBuilding  },
              { id: "audit",   label: "Audit log",  icon: TbHistory   },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:font-semibold px-2 md:px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === id ? "bg-white/5 text-white" : "text-gray-500 hover:text-gray-300"
                }`}>
                <Icon className="text-xs" /> {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "tenants" && (
          <button onClick={() => setSlideOver("create")}
            className="flex items-center gap-0.5 md:gap-1.5 text-[10px] md:text-xs md:font-semibold md:px-3 px-2 py-1 md:py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
            <TbPlus className="text-sm" /> Add tenant
          </button>
        )}
      </div>

      <div className="px-6 py-6 max-w-[1400px] mx-auto">

        {activeTab === "audit" ? (
          <AuditLogPanel />
        ) : (
          <>
            {/* stats */}
            {!loading && !fetchError && <StatsBar tenants={tenants} />}

            {/* bulk action bar — appears when items are selected */}
            {selected.size > 0 && (
              <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <span className="text-xs font-semibold text-emerald-400">
                  {selected.size} tenant{selected.size > 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => handleBulkAction("activate")} disabled={bulkSubmitting}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/30 disabled:opacity-40 transition-colors">
                    Activate all
                  </button>
                  <button onClick={() => handleBulkAction("deactivate")} disabled={bulkSubmitting}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 disabled:opacity-40 transition-colors">
                    Deactivate all
                  </button>
                  <button onClick={clearAll}
                    className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* search + filter */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2 bg-white/[0.03] border border-[#1e293b] rounded-xl px-3 py-2 flex-1 max-w-sm focus-within:border-white/15 transition-colors">
                <TbSearch className="text-gray-500 text-sm flex-shrink-0" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tenants..."
                  className="bg-transparent text-xs text-gray-200 placeholder-gray-600 focus:outline-none flex-1" />
                {search && (
                  <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300">
                    <TbX className="text-xs" />
                  </button>
                )}
              </div>

              <div className="flex gap-1.5">
                {["all", "active", "inactive"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-xl border capitalize transition-colors ${
                      filter === f
                        ? "bg-white/5 text-white border-white/15"
                        : "text-gray-500 border-transparent hover:text-gray-300"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>

              {visible.length > 0 && (
                <button onClick={selected.size === visible.length ? clearAll : selectAll}
                  className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors ml-1">
                  {selected.size === visible.length ? "Deselect all" : "Select all"}
                </button>
              )}

              <button onClick={fetchTenants} disabled={loading}
                className="ml-auto text-gray-500 hover:text-gray-300 p-2 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-30">
                <TbRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <TbLoader2 className="text-2xl text-emerald-400 animate-spin" />
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <TbAlertCircle className="text-3xl text-red-400" />
                <p className="text-sm text-gray-400">{fetchError}</p>
                <button onClick={fetchTenants} className="text-xs text-emerald-400 hover:text-emerald-300">Try again</button>
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <TbBuilding className="text-4xl text-gray-700" />
                <p className="text-sm text-gray-500">
                  {search || filter !== "all" ? "No tenants match your filters" : "No tenants yet"}
                </p>
                {!search && filter === "all" && (
                  <button onClick={() => setSlideOver("create")}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                    <TbPlus className="text-sm" /> Add the first tenant
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {visible.map((tenant) => (
                  <TenantCard
                    key={tenant.tenantId}
                    tenant={tenant}
                    selected={selected.has(tenant.tenantId)}
                    onSelect={toggleSelect}
                    onEdit={(t) => setSlideOver(t)}
                    onDelete={(t) => setDeleteTarget(t)}
                    onToggleActive={handleToggleActive}
                    onViewHealth={(t) => setHealthTarget(t)}
                    onImpersonate={(t) => setImpersonateTarget(t)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── slide-overs ── */}
      <SlideOver open={slideOver === "create"} onClose={() => setSlideOver(null)} title="Add new tenant">
        <TenantForm onSubmit={handleCreate} onCancel={() => setSlideOver(null)} submitting={submitting} submitLabel="Create tenant" />
      </SlideOver>

      <SlideOver open={typeof slideOver === "object" && slideOver !== null} onClose={() => setSlideOver(null)} title={`Edit — ${slideOver?.name || ""}`}>
        {typeof slideOver === "object" && slideOver !== null && (
          <TenantForm initial={slideOver} onSubmit={handleUpdate} onCancel={() => setSlideOver(null)} submitting={submitting} submitLabel="Save changes" />
        )}
      </SlideOver>

      <SlideOver open={!!healthTarget} onClose={() => setHealthTarget(null)} title={`Health — ${healthTarget?.name || ""}`}>
        {healthTarget && <HealthPanel tenantId={healthTarget.tenantId} />}
      </SlideOver>

      <SlideOver open={!!impersonateTarget} onClose={() => setImpersonateTarget(null)} title={`Impersonate — ${impersonateTarget?.name || ""}`}>
        {impersonateTarget && (
          <ImpersonationPanel tenant={impersonateTarget} onClose={() => setImpersonateTarget(null)} showToast={showToast} />
        )}
      </SlideOver>

      {/* ── delete modal ── */}
      {deleteTarget && (
        <DeleteModal tenant={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      {/* ── toast ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl border ${
          toast.type === "error"
            ? "bg-red-900/80 border-red-500/30 text-red-200"
            : "bg-emerald-900/80 border-emerald-500/30 text-emerald-200"
        }`}>
          {toast.type === "error" ? <TbAlertCircle className="text-sm" /> : <TbCheck className="text-sm" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default DirectorTenantsPage;