"use client";

import React, { useState, useEffect } from "react";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  managerId: number | null;
  manager?: { id: number; name: string; email: string } | null;
  employees?: Array<{ id: number; name: string; email: string; role: string; isActive: boolean }>;
  department?: { id: number; name: string } | null;
  createdAt: string;
}

interface Permission {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function AdminRBACAndTeamHierarchy({
  onRefresh,
  activeSubTab = "hierarchy", // "hierarchy" | "matrix"
}: {
  onRefresh?: () => void;
  activeSubTab?: "hierarchy" | "matrix";
}) {
  const [subTab, setSubTab] = useState<"hierarchy" | "matrix">(activeSubTab);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [managers, setManagers] = useState<Array<{ id: number; name: string; email: string; department: string; employeeCount: number }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // RBAC Matrix State
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [isUpdatingPerm, setIsUpdatingPerm] = useState<string | null>(null);

  // Promotion / Demotion Modal State
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [targetRole, setTargetRole] = useState<"Employee" | "Manager" | "Admin">("Manager");
  const [targetManagerId, setTargetManagerId] = useState<string>("");
  const [promotionReason, setPromotionReason] = useState<string>("");
  const [isSubmittingPromotion, setIsSubmittingPromotion] = useState<boolean>(false);

  // Approval In-Flight State
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  const fetchHierarchyData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all users including pending managers
      const usersRes = await fetch("/api/users?all=true");
      const usersData = await usersRes.json();
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      }

      // 2. Fetch managers list
      const mgrRes = await fetch("/api/users/managers");
      const mgrData = await mgrRes.json();
      if (mgrData.managers) {
        setManagers(mgrData.managers);
      }

      // 3. Fetch RBAC Matrix
      const permRes = await fetch("/api/permissions");
      const permData = await permRes.json();
      if (permData.success) {
        setRoles(permData.roles);
        setPermissions(permData.permissions);
        setMatrix(permData.matrix);
      }
    } catch (err) {
      console.error("Failed to load hierarchy / RBAC data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchyData();
  }, []);

  // Handle Permission Toggle
  const handleTogglePermission = async (roleName: string, permCode: string, currentVal: boolean) => {
    const newVal = !currentVal;
    const key = `${roleName}:${permCode}`;
    setIsUpdatingPerm(key);

    // Optimistic UI update
    setMatrix((prev) => ({
      ...prev,
      [roleName]: {
        ...(prev[roleName] || {}),
        [permCode]: newVal,
      },
    }));

    try {
      const res = await fetch("/api/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName,
          permissionCode: permCode,
          isEnabled: newVal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update permission");
      }
    } catch (err: any) {
      alert(err.message);
      // Revert optimistic update
      setMatrix((prev) => ({
        ...prev,
        [roleName]: {
          ...(prev[roleName] || {}),
          [permCode]: currentVal,
        },
      }));
    } finally {
      setIsUpdatingPerm(null);
    }
  };

  // Handle Manager Signup Approval / Rejection
  const handleManagerApprovalDecision = async (userId: number, decision: "Approve" | "Reject") => {
    setActionInProgressId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${decision.toLowerCase()} manager`);
      alert(data.message);
      fetchHierarchyData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Open Promotion Modal
  const openPromoteModal = (user: UserItem) => {
    setSelectedUser(user);
    setTargetRole(
      user.role === "Employee"
        ? "Manager"
        : user.role === "Manager"
        ? "Admin"
        : "Manager"
    );
    setTargetManagerId(user.managerId ? user.managerId.toString() : "");
    setPromotionReason("");
    setIsPromoteModalOpen(true);
  };

  // Submit Promotion
  const handleExecutePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmittingPromotion(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}/promote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newRole: targetRole,
          managerId: targetRole === "Employee" && targetManagerId ? targetManagerId : null,
          reason: promotionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user role");

      alert(data.message);
      setIsPromoteModalOpen(false);
      fetchHierarchyData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingPromotion(false);
    }
  };

  // Categorize users
  const pendingManagers = users.filter(
    (u) => u.role === "Manager" && !u.isActive
  );
  const activeAdmins = users.filter((u) => u.role === "Admin" && u.isActive);
  const activeManagers = users.filter((u) => u.role === "Manager" && u.isActive);
  const activeEmployees = users.filter((u) => u.role === "Employee" && u.isActive);

  // Group employees by managerId
  const managerTeamMap: Record<number, UserItem[]> = {};
  const unassignedEmployees: UserItem[] = [];

  activeEmployees.forEach((emp) => {
    if (emp.managerId) {
      if (!managerTeamMap[emp.managerId]) {
        managerTeamMap[emp.managerId] = [];
      }
      managerTeamMap[emp.managerId].push(emp);
    } else {
      unassignedEmployees.push(emp);
    }
  });

  // Group permissions by category
  const permissionsByCategory: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!permissionsByCategory[p.category]) {
      permissionsByCategory[p.category] = [];
    }
    permissionsByCategory[p.category].push(p);
  });

  return (
    <div className="space-y-6">
      {/* Header Toolbar & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container/60 backdrop-blur-xl p-5 rounded-2xl border border-outline-variant/30 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/10 text-red-500 material-symbols-outlined text-2xl">
              account_tree
            </span>
            <div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">
                Team Hierarchy & RBAC Governance
              </h2>
              <p className="text-xs text-on-surface-variant">
                Manage managerial reporting trees, role promotions, and enterprise capability matrix.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          <button
            onClick={() => setSubTab("hierarchy")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === "hierarchy"
                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-600/20"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            Team Hierarchy & Promotions ({users.length})
          </button>
          <button
            onClick={() => setSubTab("matrix")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === "matrix"
                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-600/20"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shield</span>
            Permission Matrix (RBAC)
          </button>
        </div>
      </div>

      {/* ─── 1. PENDING MANAGER REGISTRATIONS (IF ANY) ─── */}
      {pendingManagers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                Pending Manager Approvals ({pendingManagers.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-200/80 bg-amber-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {pendingManagers.map((pm) => (
              <div
                key={pm.id}
                className="bg-surface-container-low/90 backdrop-blur-md p-4 rounded-xl border border-amber-500/30 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-on-surface">{pm.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      New Signup
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{pm.email}</p>
                  <p className="text-[11px] text-on-surface-variant/70 mt-1">
                    Registered: {new Date(pm.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                  <button
                    disabled={actionInProgressId === pm.id}
                    onClick={() => handleManagerApprovalDecision(pm.id, "Approve")}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Approve
                  </button>
                  <button
                    disabled={actionInProgressId === pm.id}
                    onClick={() => handleManagerApprovalDecision(pm.id, "Reject")}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all border border-red-500/30 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. TAB: TEAM HIERARCHY & PROMOTIONS ─── */}
      {subTab === "hierarchy" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/30 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">shield_person</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">SysAdmins</p>
                <h4 className="text-xl font-black text-on-surface">{activeAdmins.length}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/30 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">supervisor_account</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Active Managers</p>
                <h4 className="text-xl font-black text-on-surface">{activeManagers.length}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/30 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">badge</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Active Employees</p>
                <h4 className="text-xl font-black text-on-surface">{activeEmployees.length}</h4>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-outline pointer-events-none material-symbols-outlined text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* ─── MANAGERS & ASSIGNED TEAMS TREE ─── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-red-500">folder_shared</span>
              Management & Team Reporting Trees ({activeManagers.length} Teams)
            </h3>

            {activeManagers.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface-container-low/50 border border-outline-variant/30 text-center">
                <p className="text-sm text-on-surface-variant">No active managers configured yet.</p>
              </div>
            ) : (
              activeManagers
                .filter(
                  (m) =>
                    !searchQuery ||
                    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((mgr) => {
                  const teamMembers = managerTeamMap[mgr.id] || [];
                  return (
                    <div
                      key={mgr.id}
                      className="bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-5 shadow-lg space-y-4"
                    >
                      {/* Manager Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white font-bold flex items-center justify-center shadow-md shadow-red-600/20">
                            {mgr.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-on-surface">{mgr.name}</h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                                MANAGER
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant">{mgr.email}</p>
                          </div>
                        </div>

                        {/* Manager Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-xs font-semibold text-on-surface-variant px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/20">
                            {teamMembers.length} Direct Report{teamMembers.length !== 1 ? "s" : ""}
                          </span>
                          <button
                            onClick={() => openPromoteModal(mgr)}
                            className="px-3 py-1.5 bg-surface-container-highest hover:bg-red-600 text-on-surface hover:text-white rounded-lg text-xs font-bold transition-all border border-outline-variant/40 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                            Change Role / Promote
                          </button>
                        </div>
                      </div>

                      {/* Direct Reports / Subordinates List */}
                      <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-red-500/30 ml-3 sm:ml-4">
                        {teamMembers.length === 0 ? (
                          <p className="text-xs text-on-surface-variant/70 italic py-1">
                            No employees assigned to this manager yet.
                          </p>
                        ) : (
                          teamMembers.map((emp) => (
                            <div
                              key={emp.id}
                              className="bg-surface-container-low/80 hover:bg-surface-container-high/60 p-3 rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-on-surface-variant text-base">
                                  subdirectory_arrow_right
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-on-surface">{emp.name}</span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-400">
                                      EMPLOYEE
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-on-surface-variant">{emp.email}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => openPromoteModal(emp)}
                                className="self-end sm:self-auto px-2.5 py-1 bg-surface-container-highest hover:bg-red-600 text-on-surface hover:text-white rounded-lg text-[11px] font-bold transition-all border border-outline-variant/30 flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                                Promote / Reassign
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* ─── UNASSIGNED EMPLOYEES (IF ANY) ─── */}
          {unassignedEmployees.length > 0 && (
            <div className="bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-amber-400">person_off</span>
                  Unassigned Employees ({unassignedEmployees.length})
                </h3>
                <span className="text-xs text-on-surface-variant/80">
                  Assign to a manager to enable direct team booking routing
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {unassignedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-on-surface">{emp.name}</h5>
                      <p className="text-xs text-on-surface-variant">{emp.email}</p>
                    </div>
                    <button
                      onClick={() => openPromoteModal(emp)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                      Assign / Promote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SYSADMINS LIST ─── */}
          <div className="bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-purple-400">admin_panel_settings</span>
              System Administrators ({activeAdmins.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activeAdmins.map((adm) => (
                <div
                  key={adm.id}
                  className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center">
                      {adm.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-sm font-bold text-on-surface">{adm.name}</h5>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-purple-500/20 text-purple-300">
                          SYSADMIN
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{adm.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openPromoteModal(adm)}
                    className="px-2.5 py-1.5 bg-surface-container-highest hover:bg-red-600 text-on-surface hover:text-white rounded-lg text-xs font-bold transition-all border border-outline-variant/30 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                    Change Role
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. TAB: PERMISSION MATRIX (RBAC) ─── */}
      {subTab === "matrix" && (
        <div className="bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">lock_open</span>
                Enterprise Role Capability Matrix
              </h3>
              <p className="text-xs text-on-surface-variant">
                Toggle specific system permissions for each role. Changes apply live across active sessions.
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-semibold border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-high/80 border-b border-outline-variant/30">
                  <th className="p-3.5 font-bold text-on-surface uppercase tracking-wider">
                    Capability / Permission
                  </th>
                  <th className="p-3.5 font-bold text-on-surface uppercase tracking-wider text-center w-28">
                    Employee
                  </th>
                  <th className="p-3.5 font-bold text-on-surface uppercase tracking-wider text-center w-28">
                    Manager
                  </th>
                  <th className="p-3.5 font-bold text-on-surface uppercase tracking-wider text-center w-28">
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr className="bg-surface-container-low/60">
                      <td colSpan={4} className="px-3.5 py-2 text-[11px] font-extrabold text-red-400 uppercase tracking-wider">
                        {category}
                      </td>
                    </tr>

                    {/* Permissions in this Category */}
                    {perms.map((p) => {
                      return (
                        <tr key={p.id} className="hover:bg-surface-container-highest/30 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-on-surface text-xs">{p.name}</p>
                            <p className="text-[11px] text-on-surface-variant/80 mt-0.5">{p.description}</p>
                            <code className="text-[10px] text-red-400/80 font-mono mt-1 block">{p.code}</code>
                          </td>

                          {/* Employee Toggle */}
                          <td className="p-3.5 text-center">
                            <button
                              disabled={isUpdatingPerm === `Employee:${p.code}`}
                              onClick={() =>
                                handleTogglePermission(
                                  "Employee",
                                  p.code,
                                  matrix["Employee"]?.[p.code] || false
                                )
                              }
                              className={`w-10 h-6 mx-auto rounded-full transition-colors relative flex items-center p-0.5 ${
                                matrix["Employee"]?.[p.code] ? "bg-red-600" : "bg-surface-container-highest"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                  matrix["Employee"]?.[p.code] ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </td>

                          {/* Manager Toggle */}
                          <td className="p-3.5 text-center">
                            <button
                              disabled={isUpdatingPerm === `Manager:${p.code}`}
                              onClick={() =>
                                handleTogglePermission(
                                  "Manager",
                                  p.code,
                                  matrix["Manager"]?.[p.code] || false
                                )
                              }
                              className={`w-10 h-6 mx-auto rounded-full transition-colors relative flex items-center p-0.5 ${
                                matrix["Manager"]?.[p.code] ? "bg-red-600" : "bg-surface-container-highest"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                  matrix["Manager"]?.[p.code] ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </td>

                          {/* Admin Toggle */}
                          <td className="p-3.5 text-center">
                            <button
                              disabled={
                                isUpdatingPerm === `Admin:${p.code}` ||
                                ["PROMOTE_DEMOTE_USERS", "CONFIGURE_RBAC_PERMISSIONS"].includes(p.code)
                              }
                              onClick={() =>
                                handleTogglePermission(
                                  "Admin",
                                  p.code,
                                  matrix["Admin"]?.[p.code] || false
                                )
                              }
                              className={`w-10 h-6 mx-auto rounded-full transition-colors relative flex items-center p-0.5 ${
                                matrix["Admin"]?.[p.code] ? "bg-red-600" : "bg-surface-container-highest"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                  matrix["Admin"]?.[p.code] ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 4. PROMOTION & DEMOTION MODAL ─── */}
      {isPromoteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-container/95 border border-outline-variant/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-600/10 text-red-500 material-symbols-outlined text-xl">
                  manage_accounts
                </span>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Update User Role / Promote</h3>
                  <p className="text-xs text-on-surface-variant">{selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPromoteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleExecutePromotion} className="space-y-4">
              {/* Target Position Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                  Select New Authority Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Employee", "Manager", "Admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRole(r)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        targetRole === r
                          ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/25"
                          : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:text-on-surface"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reporting Manager Assignment (if target is Employee) */}
              {targetRole === "Employee" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                    Assigned Reporting Manager
                  </label>
                  <select
                    value={targetManagerId}
                    onChange={(e) => setTargetManagerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-red-500"
                  >
                    <option value="">No Direct Manager (Unassigned)</option>
                    {managers
                      .filter((m) => m.id !== selectedUser.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.department})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Administrative Reason / Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                  Administrative Promotion Reason / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assigned as Engineering Lead for Q3"
                  value={promotionReason}
                  onChange={(e) => setPromotionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface-variant leading-relaxed">
                <p>
                  <strong>Role Shift Impact:</strong> Updating from{" "}
                  <span className="text-red-400 font-bold">{selectedUser.role}</span> to{" "}
                  <span className="text-emerald-400 font-bold">{targetRole}</span> will recalculate permissions immediately and alert the employee via email and workspace notification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPromotion}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-red-600/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingPromotion ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Confirm Role Shift
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
