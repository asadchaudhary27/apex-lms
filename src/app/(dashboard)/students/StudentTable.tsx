"use client";

import { useState } from "react";
import { createUser } from "@/app/actions/users";
import { enrollStudent, recordAttendance } from "@/app/actions/students";
import { Search, Download, UserPlus, X, GraduationCap, Clock } from "lucide-react";

export default function StudentTable({ students, sections }: { students: any[]; sections: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState<string | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["Name", "Email", "Sections", "Joined Date"];
    const rows = filtered.map((s) => [
      s.name || "",
      s.email,
      s.sectionEnrollments?.map((e: any) => `${e.section.class.name}-${e.section.name}`).join("; ") || "",
      s.joinedAt ? new Date(s.joinedAt).toISOString().split("T")[0] : "",
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = "students.csv";
    a.click();
  };

  async function handleCreate(formData: FormData) {
    setLoading(true);
    formData.append("role", "STUDENT");
    try {
      await createUser(formData);
      setShowAddModal(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  async function handleEnroll(formData: FormData) {
    setLoading(true);
    formData.append("studentId", showEnrollModal as string);
    try {
      await enrollStudent(formData);
      setShowEnrollModal(null);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  async function handleAttendance(formData: FormData) {
    setLoading(true);
    formData.append("userId", showAttendanceModal.id);
    formData.append("type", "STUDENT");
    try {
      await recordAttendance(formData);
      setShowAttendanceModal(null);
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
          <h2 className="text-xl font-bold text-gray-900">Student Roster</h2>
          <p className="text-sm text-gray-400">{filtered.length} of {students.length} students</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full sm:w-56 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-300 transition-all shadow-sm">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <UserPlus size={14} /> Admit Student
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-5 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-5 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Enrollment</th>
              <th className="px-5 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-5 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {s.name?.[0] || "S"}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.rollNumber || "No Roll No"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-700">{s.email}</div>
                  <div className="text-xs text-gray-400">{s.phone || "-"}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {s.sectionEnrollments?.map((e: any) => (
                      <span key={e.id} className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-xs font-bold">
                        {e.section.class.name} - {e.section.name}
                      </span>
                    ))}
                    {(!s.sectionEnrollments || s.sectionEnrollments.length === 0) && (
                      <span className="text-xs text-gray-400 font-medium italic">Unassigned</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                  {s.joinedAt ? new Date(s.joinedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowEnrollModal(s.id)}
                      className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Enroll in Section"
                    >
                      <GraduationCap size={16} />
                    </button>
                    <button
                      onClick={() => setShowAttendanceModal(s)}
                      className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Mark Attendance"
                    >
                      <Clock size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={32} className="text-gray-300 mb-3" />
                    <p>No students found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Admit Student</h3>
                <p className="text-xs text-gray-400 mt-1">Create a new student profile</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-xl transition-colors">
                <X size={16} />
              </button>
            </div>
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Full Name</label>
                <input name="name" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Email</label>
                <input type="email" name="email" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Password</label>
                <input type="password" name="password" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Roll No</label>
                  <input name="rollNumber" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Phone</label>
                  <input name="phone" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all">
                  {loading ? "Saving..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Enroll in Section</h3>
              <button onClick={() => setShowEnrollModal(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <form action={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Select Section</label>
                <select name="sectionId" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none">
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.class.name} - {s.name}</option>
                  ))}
                  {sections.length === 0 && <option value="">No sections available</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Roll Number (Class specific)</label>
                <input name="rollNo" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {loading ? "Processing..." : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Mark Attendance</h3>
              <button onClick={() => setShowAttendanceModal(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <form action={handleAttendance} className="space-y-4">
              <p className="text-sm font-medium text-gray-800 mb-2">Student: {showAttendanceModal.name}</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Status Today</label>
                <select name="status" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none">
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">On Leave</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {loading ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
