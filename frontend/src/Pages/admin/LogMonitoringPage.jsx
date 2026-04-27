import React, { useEffect, useMemo, useState } from "react";
import { IoSearch } from "react-icons/io5";
import useGetDeletionLog from "../../hooks/admins/useGetDeletionLog";
import { getItem } from "../../utils/encode";
import Fuse from "fuse.js";
import highlightText from "../../hooks/highlightText";
import axiosInstance from "../../instances/Axiosinstances";
import toast from "../../components/toaster/Toast";
import LogTableSkeleton from "../../components/loaders/controls/LogTableSkeleton";


const STATIC_LOGS = [
  {
    logId: "69e983ebd1e84cbfde43b99c",
    status: "restored",
    deletionType: "admin_action",
    deletedAt: "2026-04-23T02:28:59.707Z",
    expiresAt: "2026-07-22T02:28:59.707Z",
    restoredAt: "2026-04-23T02:30:42.830Z",
    restoredBy: "yugeshkaran01@gmail.com",
    deletedBy: {
      email: "yugeshkaran01@gmail.com",
      name: "Yugesh Karan",
      role: "admin",
    },
    authorEmail: "21aid145@dsuniversity.ac.in",
    authorName: "admin",
    authorRole: "admin",
    postCount: 1,
  },
  {
    logId: "69e980b7ed3172849d840aaf",
    status: "restored",
    deletionType: "admin_action",
    deletedAt: "2026-04-23T02:15:19.945Z",
    expiresAt: "2026-07-22T02:15:19.945Z",
    restoredAt: "2026-04-23T02:17:29.179Z",
    restoredBy: "yugeshkaran01@gmail.com",
    deletedBy: {
      email: "yugeshkaran01@gmail.com",
      name: "Yugesh Karan",
      role: "admin",
    },
    authorEmail: "21aid145@dsuniversity.ac.in",
    authorName: "admin",
    authorRole: "admin",
    postCount: 1,
  },
  {
    logId: "69e97e4bcb8c30f1eb6ab7f4",
    status: "restored",
    deletionType: "self",
    deletedAt: "2026-04-23T02:04:59.449Z",
    expiresAt: "2026-07-22T02:04:59.449Z",
    restoredAt: "2026-04-23T02:06:13.055Z",
    restoredBy: "yugeshkaran01@gmail.com",
    deletedBy: {
      email: "21aid145@dsuniversity.ac.in",
      name: "admin",
      role: "admin",
    },
    authorEmail: "21aid145@dsuniversity.ac.in",
    authorName: "admin",
    authorRole: "admin",
    postCount: 1,
  },
  {
    logId: "69e97e4bcb8c30f1eb6ab7f4",
    status: "deleted",
    deletionType: "self",
    deletedAt: "2026-04-23T02:04:59.449Z",
    expiresAt: "2026-07-22T02:04:59.449Z",
    restoredAt: "2026-04-23T02:06:13.055Z",
    restoredBy: "yugeshkaran01@gmail.com",
    deletedBy: {
      email: "21aid145@dsuniversity.ac.in",
      name: "admin",
      role: "admin",
    },
    authorEmail: "21aid145@dsuniversity.ac.in",
    authorName: "admin",
    authorRole: "admin",
    postCount: 1,
  },
  {
    logId: "69e97e4bcb8c30f1eb6ab7f4",
    status: "expired",
    deletionType: "self",
    deletedAt: "2026-04-23T02:04:59.449Z",
    expiresAt: "2026-07-22T02:04:59.449Z",
    restoredAt: "2026-04-23T02:06:13.055Z",
    restoredBy: "yugeshkaran01@gmail.com",
    deletedBy: {
      email: "21aid145@dsuniversity.ac.in",
      name: "admin",
      role: "admin",
    },
    authorEmail: "21aid145@dsuniversity.ac.in",
    authorName: "admin",
    authorRole: "admin",
    postCount: 1,
  },
];

function LogMonitoringPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const email = getItem("email");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreLogId, setRestoreLogId] = useState(null);
  const [deleteLogId, setDeleteLogId] = useState(null);
  const { logDetails, setLogDetails, totalLogs, loading, hasMore } =
    useGetDeletionLog(email);
  // 🔹 Load static data
  // useEffect(() => {
  //   setLogs(STATIC_LOGS);
  // }, []);

  // console.log("logdetaisl", logDetails);

  // 🔹 Status logic
  const getStatus = (log) => {
    if (log.status === "restored") return "restored";

    const now = new Date();
    const expiry = new Date(log.expiresAt);

    if (now > expiry) return "expired";

    return "deleted";
  };

  // 🔹 Filtering
  useEffect(() => {
    let data = [...logDetails];

    if (statusFilter !== "all") {
      data = data.filter((log) => getStatus(log) === statusFilter);
    }

    if (search) {
      data = data.filter((log) =>
        [log.authorName, log.authorEmail, log.deletedBy?.email, log.logId]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    setFilteredLogs(data);
  }, [logs, statusFilter, search]);

  // 🔹 Stats
  const stats = useMemo(() => {
    return {
      total: logDetails?.length,
      deleted: logDetails?.filter((l) => getStatus(l) === "deleted").length,
      restored: logDetails?.filter((l) => getStatus(l) === "restored").length,
      expired: logDetails?.filter((l) => getStatus(l) === "expired").length,
    };
  }, [logDetails]);

  // // 🔹 Fake restore (UI simulation)
  // const handleRestore = async () => {
  //   if (!selectedLog) return;

  //   setRestoring(true);

  //   setTimeout(() => {
  //     setLogs((prev) =>
  //       prev.map((log) =>
  //         log.logId === selectedLog.logId
  //           ? {
  //               ...log,
  //               status: "restored",
  //               restoredAt: new Date().toISOString(),
  //               restoredBy: "admin@system.local",
  //             }
  //           : log
  //       )
  //     );

  //     setRestoring(false);
  //     setShowModal(false);
  //   }, 800); // simulate API delay
  // };

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const fuse = useMemo(() => {
    return new Fuse(logDetails, {
      keys: ["logId", "authorName", "authorEmail"],
      threshold: 0.3, // lower = stricter search
    });
  }, [logDetails]);

  const filteredData = useMemo(() => {
    let filtered = [...logDetails]

    if (debouncedSearch.trim() !== "") {
      filtered = fuse.search(debouncedSearch).map((r) => r.item);
    }
    if (statusFilter.toLowerCase() !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    return filtered;
  }, [logDetails, search, debouncedSearch, statusFilter]);

  const handleRestore = async (logId) => {
    const confirm = window.confirm(
      "Are you sure you want to restore this users?",
    );
    if (!confirm) return;

    setRestoreLogId(logId);

    try {
      const response = await axiosInstance.post(
        `/blog/admin/rollback/${logId}`,
        {
          restoredBy: email,
        },
      );

      if (response.status === 200) {
        setLogDetails((prev) =>
          prev.map((log) =>
            log.logId === logId
              ? {
                  ...log,
                  status: "restored",
                  restoredAt: new Date().toISOString(),
                  restoredBy: email,
                }
              : log,
          ),
        );
        toast.success("Restored", "Author has been restored successfully.");
      }
    } catch (err) {
      console.log("error", err.message);
      toast.error("Error", "Failed to restore author.");
    } finally {
      setRestoreLogId(null);
    }
  };

  const handleDelete = async (logId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this log permanently?",
    );
    if (!confirm) return;
    setDeleteLogId(logId);
    try {
      const response = await axiosInstance.delete(
        `/blog/admin/deletionLogs/${email}/${logId}`,
      );
      if (response.status === 200) {
        setLogDetails((prev) => prev.filter((log) => log.logId !== logId));
        toast.success("Deleted", "Log has been deleted permanently.");
      }
    } catch (err) {
      console.log("error", err.message);
      toast.error("Error", "Failed to delete author.");
    } finally {
      setDeleteLogId(null);
    }
  };

  const avatarColor = (name) => {
    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
    ];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  };

  const initials = (name) => name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-gray-900  text-white  ">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
        <div>
          <h1 className="md:text-2xl text-xl font-semibold text-emerald-400">
            Backup Logs
          </h1>
          <p className="text-xs text-gray-400">
            Monitor, backup and recover deleted user data
          </p>
        </div>
      </div>

      {/* FILTER, STATS  and SEARCH*/}
      <div className=" grid w-full md:gap-5  md:flex items-center md:mt-4 md:justify-between">
        <div className="flex gap-2 col-span-full mt-3 md:order-1 order-2  order-3 mb-3">
          {["All", "Deleted", "Restored", "Expired"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status.toLowerCase())}
              className={`px-3 py-1.5 text-xs rounded-lg border ${
                statusFilter === status.toLowerCase()
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-white/[0.03] border-white/10 text-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

            <div className="flex items-center order-1  justify-between  md:justify-start gap-3 md:mb-2">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="bg-white/[0.03] flex items-center justify-center gap-2 md:gap-3 rounded-md px-2 md:px-3 py-1"
          >
            <p className="text-xs text-gray-400 capitalize">{key}</p>
            <p className="text-xs font-semibold ">{value}</p>
          </div>
        ))}
      </div>


        <div className="flex order-1  col-span-full md:order-3 mt-6 md:mt-0  items-center gap-2 bg-white/[0.05] border border-white/10 px-3 py-2 rounded-xl w-full md:w-80 focus-within:border-emerald-500/40 transition-colors">
          <IoSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent w-full outline-none text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
    {!loading && logDetails.length>0 ?  <div className="md:mt-4 mt-1 md:border  border-white/10 rounded-2xl overflow-hidden pb-2">
        {/* HEADER */}
        <div className="hidden lg:grid  grid-cols-[2fr_1fr_1fr_2fr_1.2fr_1.2fr_1.2fr_1.5fr_1fr] px-4 py-3 text-[11px] uppercase tracking-wider text-gray-400 bg-white/[0.03] border-b border-white/10">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          {/* <span>Type</span> */}
          <span>Deleted By</span>
          {/* <span>Deleted By</span> */}
          <span>Deleted</span>
          <span>Expires</span>
          <span>Restored</span>
          <span>Restored By</span>
          <span className="text-right">Action</span>
        </div>

        {/* ROWS */}
        <div className="hidden lg:block divide-y divide-white/5">
          {filteredData.map((log) => {
            const status = getStatus(log);

            return (
              <div
                key={log.logId}
                className="grid grid-cols-[2fr_1fr_1fr_2fr_1.2fr_1.2fr_1.2fr_1.5fr_1fr] items-center px-4 py-3 text-sm hover:bg-white/[0.03] transition"
              >
                {/* USER */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ backgroundColor: avatarColor(log.authorName) }}
                  >
                    {initials(log.authorName)}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium">
                      {/* {log.authorName} */}
                      {highlightText(log.authorName, debouncedSearch)}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {/* {log.authorEmail} */}
                      {highlightText(log.authorEmail, debouncedSearch)}
                    </span>
                  </div>
                </div>

                {/* ROLE */}
                <div className="text-xs text-gray-400">
                  {log.authorRole}
                </div>

                {/* STATUS */}
                <div>
                  <span
                    className={`px-2 py-1 text-[11px] rounded-md font-medium
              ${
                status === "deleted"
                  ? "bg-red-500/20 text-red-400"
                  : status === "restored"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-500/20 text-gray-400"
              }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Deleted By */}
                <div className="text-xs text-gray-300">
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium">
                      {log.deletedBy.name}{" "}
                      <span className=" text-gray-400 truncate">
                        ({log.deletionType})
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {log.deletedBy.email}
                    </span>
                  </div>
                </div>

                {/* DELETED AT */}
                <div className="text-xs text-gray-400">
                  {/* {new Date(log.deletedAt).toLocaleString()} */}
                  {log.deletedAt?.slice(0, 10)}
                </div>

                {/* EXPIRES AT */}
                <div className="text-xs text-gray-400">
                  {/* {new Date(log.expiresAt).toLocaleString()} */}
                  {log.expiresAt?.slice(0, 10)}
                </div>

                {/* RESTORED AT */}
                <div className="text-xs text-gray-400">
                  {log.restoredAt
                    ? // ? new Date(log.restoredAt).toLocaleString()
                      `${log.restoredAt.slice(0, 10)}`
                    : "—"}
                </div>

                {/* RESTORED BY */}
                <div className="text-xs text-gray-300 truncate">
                  {log.restoredBy || "—"}
                </div>

                {/* ACTION */}
                <div className="flex justify-end">
                  {status === "deleted" ? (
                    <button
                      onClick={() => {
                        handleRestore(log.logId);
                      }}
                      disabled={restoreLogId == log.logId}
                      className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition disabled:cursor-not-allowed disabled:bg-emerald-500/10 disabled:text-emerald-400/50 disabled:border-emerald-500/20"
                    >
                      {restoreLogId == log.logId ? "Restoring..." : "Restore"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleDelete(log.logId);
                      }}
                      disabled={deleteLogId == log.logId}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition disabled:cursor-not-allowed disabled:bg-red-500/10 disabled:text-red-400/50 disabled:border-red-500/20"
                    >
                      {deleteLogId == log.logId ? "Deleting..." : "Delete Log"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LIST */}
        <div className="lg:hidden flex flex-col  gap-4">
          {filteredData.map((log) => {
            const status = getStatus(log);

            return (
              <div
                key={log.logId}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3"
              >
                {/* TOP */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ backgroundColor: avatarColor(log.authorName) }}
                    >
                      {/* {log.authorName?.charAt(0)?.toUpperCase()} */}
                      {initials(log.authorName)}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {highlightText(log.authorName, debouncedSearch)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {/* {log.authorEmail} */}
                        {highlightText(log.authorEmail, debouncedSearch)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-2 py-1 text-[11px] rounded-md font-medium
              ${
                status === "deleted"
                  ? "bg-red-500/20 text-red-400"
                  : status === "restored"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-500/20 text-gray-400"
              }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-400">
                  <span>Role</span>
                  <span className="text-gray-300 text-right">
                    {log.authorRole}
                  </span>
                  <span>Type</span>
                  <span className="text-gray-300 text-right">
                    {log.deletionType}
                  </span>

                  <span>Deleted By</span>
                  <div className="text-xs text-right text-gray-300">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">
                        {log.deletedBy.name}{" "}
                        {/* <span className=" text-gray-400 truncate">
                        ({log.deletionType})
                      </span> */}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {log.deletedBy.email}
                      </span>
                    </div>
                  </div>

                  <span>Deleted</span>
                  <span className="text-right">
                    {log.deletedAt?.slice(0, 10)}
                  </span>

                  <span>Expires</span>
                  <span className="text-right">
                    {log.expiresAt?.slice(0, 10)}
                  </span>

                  <span>Restored</span>
                  <span className="text-right">
                    {log.restoredAt ? `${log.restoredAt.slice(0, 10)}` : "—"}
                  </span>

                  <span>Restored By</span>
                  <span className="text-gray-300 text-right truncate">
                    {log.restoredBy || "—"}
                  </span>
                </div>

                {/* ACTION */}
                {status === "deleted" ? (
                  <button
                    onClick={() => {
                      handleRestore(log.logId);
                    }}
                    disabled={restoreLogId == log.logId}
                    className="w-full py-2 rounded-lg  text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 disabled:cursor-not-allowed disabled:bg-emerald-500/10 disabled:text-emerald-400/50 disabled:border-emerald-500/20 hover:bg-emerald-500/30 transition"
                  >
                    {restoreLogId == log.logId ? "Restoring..." : "Restore"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleDelete(log.logId);
                    }}
                    disabled={deleteLogId == log.logId}
                    className="w-full py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 disabled:cursor-not-allowed disabled:bg-red-500/10 disabled:text-red-400/50 disabled:border-red-500/20 hover:bg-red-500/30 transition"
                  >
                    {deleteLogId == log.logId ? "Deleting..." : "Delete Log"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!hasMore && logDetails.length > 0 && (
          <div className="text-center text-[10px] text-gray-400 py-4 col-span-full">
            No more logs.
          </div>
        )}

        {loading && logDetails.length > 0  &&  (
          <div className="col-span-full flex my-3 justify-center">
            <div className="relative flex items-center justify-center">
              {/* Outer Oval Ring */}
              <div className="w-4 h-4  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

              {/* Inner Glow Pulse */}
              {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
            </div>
          </div>
        )}

        {!loading && logDetails.length === 0 && (
          <div className="text-center col-span-full text-[10px] text-gray-400 py-4">
            No logs found.
          </div>
        )}
      </div>: 
      <LogTableSkeleton /> }
    </div>
  );
}

export default LogMonitoringPage;
