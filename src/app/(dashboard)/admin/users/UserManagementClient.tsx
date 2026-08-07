"use client";

import { useState, useMemo } from "react";
import { Search, MoreVertical, Key, Mail, Ban, CheckCircle, Shield, GraduationCap, Users } from "lucide-react";
import { resetUserPassword, toggleUserSuspension, generateMagicLink } from "@/app/actions/users";

export default function UserManagementClient({ initialUsers, branches }: any) {
  const [activeTab, setActiveTab] = useState("STUDENT");
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const tabs = [
    { id: "STUDENT", label: "Students", icon: GraduationCap },
    { id: "TEACHER", label: "Faculty", icon: Users },
    { id: "HOD", label: "HODs", icon: Shield },
    { id: "ADMIN", label: "Admins", icon: Shield },
    { id: "PARENT", label: "Parents", icon: Users },
  ];

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((u: any) => {
      // Handle HEAD_ADMIN and ADMIN grouping
      const matchRole = activeTab === "ADMIN" 
        ? (u.role === "ADMIN" || u.role === "HEAD_ADMIN")
        : u.role === activeTab;
        
      const matchSearch = search === "" || 
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
        u.cnic?.toLowerCase().includes(search.toLowerCase());

      return matchRole && matchSearch;
    });
  }, [initialUsers, activeTab, search]);

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Reset password to 'college123'?")) return;
    setLoadingAction(userId);
    try {
      await resetUserPassword(userId);
      alert("Password reset successfully.");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleSuspend = async (userId: string, currentlySuspended: boolean) => {
    if (!confirm(currentlySuspended ? "Reactivate this account?" : "Suspend this account?")) return;
    setLoadingAction(userId);
    try {
      await toggleUserSuspension(userId, !currentlySuspended);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMagicLink = async (userId: string) => {
    setLoadingAction(userId);
    try {
      const link = await generateMagicLink(userId);
      alert(`Magic link generated (check server console): \n${link}`);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management Center</h1>
        <p className="text-sm text-gray-500 mt-1">Manage credentials, roles, and profiles for all institutional members.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-gray-100 rounded-xl w-max">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, roll number, or CNIC..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all text-gray-900" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Profile</th>
              <th className="px-6 py-4">Identifiers</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No users found for this category.</td></tr>
            )}
            {filteredUsers.map((user: any) => {
              const isSuspended = !!user.deletedAt;
              return (
                <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${isSuspended ? "opacity-60" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {user.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      {user.rollNumber && <span>Roll No: <span className="font-semibold">{user.rollNumber}</span></span>}
                      {user.cnic && <span>CNIC: <span className="font-semibold">{user.cnic}</span></span>}
                      {!user.rollNumber && !user.cnic && <span className="text-gray-400">No extra identifiers</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isSuspended ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5 w-max">
                        <Ban size={12} /> Suspended
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5 w-max">
                        <CheckCircle size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleMagicLink(user.id)} disabled={loadingAction === user.id} title="Send Magic Link"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all">
                        <Mail size={16} />
                      </button>
                      <button onClick={() => handleResetPassword(user.id)} disabled={loadingAction === user.id} title="Reset Password"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all">
                        <Key size={16} />
                      </button>
                      <button onClick={() => handleToggleSuspend(user.id, isSuspended)} disabled={loadingAction === user.id} title={isSuspended ? "Reactivate" : "Suspend Account"}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
