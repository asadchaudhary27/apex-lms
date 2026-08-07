"use client";

import { useState } from "react";
import { createUser } from "@/app/actions/users";
import { Search, UserPlus, X, Shield, Users } from "lucide-react";

const ALL_PERMISSIONS = [
  { key: "VIEW_FINANCE", label: "View Finance", desc: "Access financial records" },
  { key: "MANAGE_COURSES", label: "Manage Courses", desc: "Create and edit courses" },
  { key: "MANAGE_USERS", label: "Manage Employees", desc: "Add and edit staff" },
  { key: "MANAGE_LEAVES", label: "Approve Leaves", desc: "Review leave requests" },
];

const roleColors: Record<string, { bg: string; text: string }> = {
  HR: { bg: "bg-green-50", text: "text-green-700" },
  FINANCE: { bg: "bg-amber-50", text: "text-amber-700" },
  INSTRUCTOR: { bg: "bg-blue-50", text: "text-blue-700" },
  STAFF: { bg: "bg-gray-100", text: "text-gray-700" },
  BRANCH_ADMIN: { bg: "bg-purple-50", text: "text-purple-700" },
  SUPER_ADMIN: { bg: "bg-red-50", text: "text-red-700" },
};

export default function EmployeeTable({ employees, branches }: { employees: any[]; branches: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filtered = employees.filter(
    (e) =>
      (e.name || e.email).toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
  );

  const togglePerm = (p: string) =>
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  async function handleCreate(formData: FormData) {
    setLoading(true);
    formData.append("permissions", JSON.stringify(permissions));
    try {
      await createUser(formData);
      setShowModal(false);
      setPermissions([]);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5 fade-up">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-sm text-gray-400">{filtered.length} staff members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-56 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <UserPlus size={14} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((emp, i) => {
              const roleStyle = roleColors[emp.role] || { bg: "bg-slate-100", text: "text-slate-700" };
              const perms: string[] = emp.permissions ? JSON.parse(emp.permissions) : [];
              return (
                <tr key={emp.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: `linear-gradient(135deg, hsl(${i * 61 + 200}, 60%, 55%), hsl(${i * 61 + 240}, 60%, 55%))` }}>
                        {emp.name?.[0]?.toUpperCase() || emp.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{emp.name || "—"}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${roleStyle.bg} ${roleStyle.text}`}>
                      {emp.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.branch?.name || "Global"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {perms.length > 0 ? perms.map((p) => (
                        <span key={p} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                          {p.replace("_", " ")}
                        </span>
                      )) : <span className="text-xs text-gray-300 italic">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(emp.joinedAt).toISOString().split("T")[0]}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Users size={22} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">No employees found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-[100] p-4 sm:pt-10 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-10 overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Add Employee</h3>
                <p className="text-xs text-gray-400 mt-0.5">Create a new staff account</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <form action={handleCreate} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Name</label>
                  <input type="text" name="name" required placeholder="Name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email</label>
                  <input type="email" name="email" required placeholder="email@school.edu"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all text-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Role</label>
                  <select name="role"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all text-gray-900">
                    <option value="HR">HR</option>
                    <option value="FINANCE">Finance</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="STAFF">Staff</option>
                    <option value="BRANCH_ADMIN">Branch Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Branch</label>
                  <select name="branchId"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all text-gray-900">
                    <option value="">Global / No Branch</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Shield size={12} /> Granular Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p.key}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        permissions.includes(p.key)
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}>
                      <input type="checkbox" className="mt-0.5 accent-indigo-600"
                        checked={permissions.includes(p.key)}
                        onChange={() => togglePerm(p.key)} />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{p.label}</p>
                        <p className="text-[10px] text-gray-400">{p.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
                <button type="button" onClick={() => { setShowModal(false); setPermissions([]); }}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {loading ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
