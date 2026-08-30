import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../instances/Axiosinstances";
import { getItem } from "../../utils/encode";
import {
  TbBuilding, TbPlus, TbSearch, TbDots, TbPencil, TbTrash,
  TbCheck, TbX, TbAlertCircle, TbLoader2, TbRefresh,
  TbToggleLeft, TbToggleRight, TbWorld, TbAt, TbUsers,
  TbShield, TbSettings, TbChevronDown, TbExternalLink,
  TbBuildingSkyscraper, TbFilter, TbSortAscending,
} from "react-icons/tb";
import toast from "../../components/toaster/Toast";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "/bytes/director";   // adjust if your router mounts elsewhere

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

// ─────────────────────────────────────────────────────────────────────────────
//  SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const Badge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
      active
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-red-500/10 text-red-400"
    }`}
  >
    <span
      className={`w-1 h-1 rounded-full ${active ? "bg-emerald-400" : "bg-red-400"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
      <TbAlertCircle className="text-xs flex-shrink-0" /> {msg}
    </p>
  ) : null;

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-8 h-4 rounded-full transition-colors ${
        checked ? "bg-emerald-600" : "bg-white/10"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
    <span className="text-xs text-gray-300">{label}</span>
  </label>
);

// overflow menu
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
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
      >
        <TbDots className="text-base" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl py-1 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-white/5 ${
                item.danger ? "text-red-400" : "text-gray-300"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TENANT FORM — used for both Create and Edit
// ─────────────────────────────────────────────────────────────────────────────
const TenantForm = ({ initial, onSubmit, onCancel, submitting, submitLabel }) => {
  const [form,   setForm]   = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));
  const setConfig = (field) => (val) =>
    setForm((p) => ({ ...p, config: { ...p.config, [field]: val } }));

  const validate = () => {
    const e = {};
    if (!form.tenantId.trim())    e.tenantId    = "Tenant ID is required";
    if (!/^[a-z0-9_-]+$/.test(form.tenantId.trim()))
      e.tenantId = "Only lowercase letters, numbers, hyphens and underscores";
    if (!form.name.trim())        e.name        = "Institution name is required";
    if (!form.emailDomain.trim()) e.emailDomain = "Email domain is required";
    if (!/^[\w.-]+\.[a-z]{2,}$/.test(form.emailDomain.trim()))
      e.emailDomain = "Enter a valid domain e.g. dsuniversity.ac.in";
    if (form.config.maxUsersAllowed < 1)
      e.maxUsersAllowed = "Must be at least 1";
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
      {/* row 1: tenantId + name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Tenant ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.tenantId}
            onChange={(e) => set("tenantId")(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            placeholder="e.g. dsu"
            disabled={!!initial} // ID is immutable after creation
            className={`w-full bg-white/[0.03] border rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              errors.tenantId ? "border-red-500/40" : "border-[#1e293b]"
            }`}
          />
          {initial && <p className="text-[9px] text-gray-600 mt-1">Tenant ID cannot be changed after creation</p>}
          <FieldError msg={errors.tenantId} />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Institution name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="e.g. Dr. Sivanthi Aditanar University"
            className={`w-full bg-white/[0.03] border rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${
              errors.name ? "border-red-500/40" : "border-[#1e293b]"
            }`}
          />
          <FieldError msg={errors.name} />
        </div>
      </div>

      {/* row 2: emailDomain + subdomain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Email domain <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <TbAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              value={form.emailDomain}
              onChange={(e) => set("emailDomain")(e.target.value.toLowerCase())}
              placeholder="dsuniversity.ac.in"
              className={`w-full bg-white/[0.03] border rounded-xl pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${
                errors.emailDomain ? "border-red-500/40" : "border-[#1e293b]"
              }`}
            />
          </div>
          <FieldError msg={errors.emailDomain} />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Subdomain
            <span className="text-gray-600 font-normal ml-1 normal-case tracking-normal">— optional</span>
          </label>
          <div className="relative">
            <TbWorld className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              value={form.subdomain}
              onChange={(e) => set("subdomain")(e.target.value.toLowerCase())}
              placeholder="dsu → dsu.bytesbase.me"
              className="w-full bg-white/[0.03] border border-[#1e293b] rounded-xl pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* row 3: active toggle */}
      <div className="flex items-center gap-6 py-1">
        <Toggle
          checked={form.active}
          onChange={set("active")}
          label="Tenant active"
        />
      </div>

      {/* config section */}
      <div className="border border-[#1e293b] rounded-xl p-4 flex flex-col gap-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          Configuration
        </p>

        <div className="flex flex-col gap-3">
          <Toggle
            checked={form.config.allowPublicProfiles}
            onChange={setConfig("allowPublicProfiles")}
            label="Allow public profiles"
          />
          <Toggle
            checked={form.config.customBranding}
            onChange={setConfig("customBranding")}
            label="Custom branding"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Max users allowed
          </label>
          <input
            type="number"
            min={1}
            value={form.config.maxUsersAllowed}
            onChange={(e) => setConfig("maxUsersAllowed")(Number(e.target.value))}
            className={`w-40 bg-white/[0.03] border rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-white/20 transition-colors ${
              errors.maxUsersAllowed ? "border-red-500/40" : "border-[#1e293b]"
            }`}
          />
          <FieldError msg={errors.maxUsersAllowed} />
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
        >
          {submitting ? (
            <><TbLoader2 className="animate-spin text-sm" /> Saving...</>
          ) : (
            <><TbCheck className="text-sm" /> {submitLabel}</>
          )}
        </button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE-OVER PANEL
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
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-[#0a0f1a] border-l border-[#1e293b] flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 0.2s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <TbX className="text-base" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({ tenant, onConfirm, onCancel, deleting }) => (
  <>
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
          <b className="text-gray-200">{tenant.name}</b>{" "}
          (<code className="text-emerald-400">{tenant.tenantId}</code>). All tenant data — users, posts, communities — will remain in the database but this tenant record will be removed.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2 text-xs font-medium text-gray-400 border border-[#1e293b] rounded-xl hover:border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {deleting ? <><TbLoader2 className="animate-spin text-sm" /> Deleting...</> : "Delete tenant"}
          </button>
        </div>
      </div>
    </div>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
//  TENANT CARD
// ─────────────────────────────────────────────────────────────────────────────
const TenantCard = ({ tenant, onEdit, onDelete, onToggleActive }) => {
  const menuItems = [
    { label: "Edit",            icon: <TbPencil className="text-sm" />,      onClick: () => onEdit(tenant) },
    {
      label: tenant.active ? "Deactivate" : "Activate",
      icon: tenant.active
        ? <TbToggleLeft className="text-sm" />
        : <TbToggleRight className="text-sm text-emerald-400" />,
      onClick: () => onToggleActive(tenant),
    },
    { label: "Delete",          icon: <TbTrash className="text-sm" />,       onClick: () => onDelete(tenant), danger: true },
  ];

  return (
    <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-xl p-4 hover:border-white/10 transition-all duration-200 flex flex-col gap-3">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <TbBuildingSkyscraper className="text-emerald-400 text-base" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-200 truncate">{tenant.name}</h3>
            <code className="text-[10px] text-emerald-400/70">{tenant.tenantId}</code>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge active={tenant.active} />
          <OverflowMenu items={menuItems} />
        </div>
      </div>

      {/* meta */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <TbAt className="text-xs text-gray-600 flex-shrink-0" />
          <span className="truncate">{tenant.emailDomain}</span>
        </div>
        {tenant.subdomain && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <TbWorld className="text-xs text-gray-600 flex-shrink-0" />
            <span>{tenant.subdomain}.bytesbase.me</span>
            <TbExternalLink className="text-[10px] text-gray-600" />
          </div>
        )}
      </div>

      {/* config pills */}
      <div className="flex gap-1.5 flex-wrap">
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-[#1e293b] text-gray-500">
          {tenant.config?.maxUsersAllowed?.toLocaleString() || "10,000"} users max
        </span>
        {tenant.config?.allowPublicProfiles && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400">
            Public profiles
          </span>
        )}
        {tenant.config?.customBranding && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400">
            Custom branding
          </span>
        )}
      </div>

      {/* footer */}
      <div className="pt-2 border-t border-white/[0.04] text-[9px] text-gray-600">
        Created {new Date(tenant.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  STATS BAR
// ─────────────────────────────────────────────────────────────────────────────
const StatsBar = ({ tenants }) => {
  const total    = tenants.length;
  const active   = tenants.filter((t) => t.active).length;
  const inactive = total - active;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: "Total tenants",   value: total,    icon: TbBuilding,      color: "text-gray-300" },
        { label: "Active",          value: active,   icon: TbToggleRight,   color: "text-emerald-400" },
        { label: "Inactive",        value: inactive, icon: TbToggleLeft,    color: "text-red-400" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-[#0a0f1a] border border-[#1e293b] rounded-xl px-4 py-3 flex items-center gap-3">
          <Icon className={`text-xl ${color}`} />
          <div>
            <p className="text-lg font-bold text-gray-200">{value}</p>
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

  // guard
  useEffect(() => {
    if (role !== "admin") navigate("/", { replace: true });
  }, [role, navigate]);

  // ── data state ─────────────────────────────────────────────────────────────
  const [tenants,   setTenants]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchError,setFetchError]= useState(null);

  // ── ui state ───────────────────────────────────────────────────────────────
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all"); // all | active | inactive
  const [slideOver, setSlideOver] = useState(null);  // null | 'create' | tenant object (edit)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [toaster,        setToaster]        = useState(null);

  // ── toast helper ───────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "success") => {
    setToaster({ msg, type });
    setTimeout(() => setToaster(null), 3000);
  }, []);

  // ── fetch all tenants ──────────────────────────────────────────────────────
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

  // ── filtered + searched list ───────────────────────────────────────────────
  const visible = useMemo(() => {
    let list = tenants;
    if (filter === "active")   list = list.filter((t) =>  t.active);
    if (filter === "inactive") list = list.filter((t) => !t.active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tenantId.toLowerCase().includes(q) ||
          t.emailDomain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tenants, filter, search]);

  // ── create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`${BASE}/tenants`, form);
      setTenants((prev) => [res.data.tenant, ...prev]);
      setSlideOver(null);
      showToast(`${res.data.tenant.name} created successfully`);
      if(res.status===201){
        toast.success("Tenant Created")
      }
      {

      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create tenant", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── update ─────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setSubmitting(true);
    try {
      const res = await axiosInstance.put(
        `${BASE}/tenants/${form.tenantId}`,
        form
      );
      setTenants((prev) =>
        prev.map((t) => (t.tenantId === form.tenantId ? res.data.tenant : t))
      );
      setSlideOver(null);
      showToast(`${res.data.tenant.name} updated`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update tenant", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── toggle active ──────────────────────────────────────────────────────────
  const handleToggleActive = async (tenant) => {
    try {
      const res = await axiosInstance.put(`${BASE}/tenants/${tenant.tenantId}`, {
        active: !tenant.active,
      });
      setTenants((prev) =>
        prev.map((t) => (t.tenantId === tenant.tenantId ? res.data.tenant : t))
      );
      showToast(
        res.data.tenant.active
          ? `${tenant.name} activated`
          : `${tenant.name} deactivated`
      );
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update tenant", "error");
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
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
      <div className="sticky top-0 z-30 bg-[#060b14]/90 backdrop-blur border-b border-[#1e293b] px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <TbShield className="text-emerald-400 text-sm" />
          </div>
          <span className="text-sm font-semibold text-gray-200">Director console</span>
          <span className="text-[10px] text-gray-600">·</span>
          <span className="text-[10px] text-gray-500">Tenant management</span>
        </div>
        <button
          onClick={() => setSlideOver("create")}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          <TbPlus className="text-sm" /> Add tenant
        </button>
      </div>

      <div className="px-6 py-6 max-w-[1400px] mx-auto">

        {/* ── stats bar ── */}
        {!loading && !fetchError && <StatsBar tenants={tenants} />}

        {/* ── search + filter bar ── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-[#1e293b] rounded-xl px-3 py-2 flex-1 max-w-sm focus-within:border-white/15 transition-colors">
            <TbSearch className="text-gray-500 text-sm flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenants..."
              className="bg-transparent text-xs text-gray-200 placeholder-gray-600 focus:outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300">
                <TbX className="text-xs" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            {["all", "active", "inactive"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-xl border capitalize transition-colors ${
                  filter === f
                    ? "bg-white/5 text-white border-white/15"
                    : "text-gray-500 border-transparent hover:text-gray-300 hover:border-white/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={fetchTenants}
            disabled={loading}
            className="ml-auto text-gray-500 hover:text-gray-300 p-2 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-30"
            title="Refresh"
          >
            <TbRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── content ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <TbLoader2 className="text-2xl text-emerald-400 animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <TbAlertCircle className="text-3xl text-red-400" />
            <p className="text-sm text-gray-400">{fetchError}</p>
            <button
              onClick={fetchTenants}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <TbBuilding className="text-4xl text-gray-700" />
            <p className="text-sm text-gray-500">
              {search || filter !== "all" ? "No tenants match your filters" : "No tenants yet"}
            </p>
            {!search && filter === "all" && (
              <button
                onClick={() => setSlideOver("create")}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
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
                onEdit={(t) => setSlideOver(t)}
                onDelete={(t) => setDeleteTarget(t)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── create slide-over ── */}
      <SlideOver
        open={slideOver === "create"}
        onClose={() => setSlideOver(null)}
        title="Add new tenant"
      >
        <TenantForm
          onSubmit={handleCreate}
          onCancel={() => setSlideOver(null)}
          submitting={submitting}
          submitLabel="Create tenant"
        />
      </SlideOver>

      {/* ── edit slide-over ── */}
      <SlideOver
        open={typeof slideOver === "object" && slideOver !== null}
        onClose={() => setSlideOver(null)}
        title={`Edit — ${slideOver?.name || ""}`}
      >
        {typeof slideOver === "object" && slideOver !== null && (
          <TenantForm
            initial={slideOver}
            onSubmit={handleUpdate}
            onCancel={() => setSlideOver(null)}
            submitting={submitting}
            submitLabel="Save changes"
          />
        )}
      </SlideOver>

      {/* ── delete modal ── */}
      {deleteTarget && (
        <DeleteModal
          tenant={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* ── toast ── */}
      {toaster && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2
            px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl border transition-all
            ${toaster.type === "error"
              ? "bg-red-900/80 border-red-500/30 text-red-200"
              : "bg-emerald-900/80 border-emerald-500/30 text-emerald-200"
            }`}
        >
          {toaster.type === "error"
            ? <TbAlertCircle className="text-sm" />
            : <TbCheck className="text-sm" />
          }
          {toaster.msg}
        </div>
      )}
    </div>
  );
}

export default DirectorTenantsPage;