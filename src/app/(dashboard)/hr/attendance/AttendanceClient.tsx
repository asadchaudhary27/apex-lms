"use client";

import { useState } from "react";
import { markAttendance, updateStaffBioData } from "@/app/actions/attendance";
import { ChevronDown, X, UserCircle, Phone, CreditCard, MapPin, BookOpen, Briefcase } from "lucide-react";

type StaffMember = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  phone?: string | null;
  cnic?: string | null;
  address?: string | null;
  designation?: string | null;
  bio?: string | null;
  education?: string | null;
  branch?: { id: string; name: string } | null;
  attendances: { id: string; date: Date | string; status: string }[];
};

type Branch = { id: string; name: string };

const statusColors: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-yellow-100 text-yellow-700",
};

export default function AttendanceClient({
  staff,
  branches,
  branchId,
}: {
  staff: StaffMember[];
  branches: Branch[];
  branchId: string;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<StaffMember | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = staff.filter(
    (s) =>
      (s.name || s.email).toLowerCase().includes(search.toLowerCase()) ||
      (s.role || "").toLowerCase().includes(search.toLowerCase())
  );

  function getAttendanceForDate(member: StaffMember) {
    return member.attendances.find(
      (a) => new Date(a.date).toISOString().split("T")[0] === selectedDate
    );
  }

  async function handleMark(userId: string, status: string) {
    setLoading(userId + status);
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("status", status);
    fd.append("date", selectedDate);
    fd.append("branchId", branchId);
    try {
      await markAttendance(fd);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(null);
  }

  async function handleBioSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBioLoading(true);
    setBioMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.append("userId", profileUser!.id);
    try {
      await updateStaffBioData(fd);
      setBioMsg({ type: "success", text: "Profile saved successfully!" });
    } catch (e: any) {
      setBioMsg({ type: "error", text: e.message });
    }
    setBioLoading(false);
  }

  // Summary stats for selected date
  const presentCount = filtered.filter((s) => getAttendanceForDate(s)?.status === "PRESENT").length;
  const absentCount = filtered.filter((s) => getAttendanceForDate(s)?.status === "ABSENT").length;
  const leaveCount = filtered.filter((s) => getAttendanceForDate(s)?.status === "LEAVE").length;
  const notMarked = filtered.length - presentCount - absentCount - leaveCount;

  return (
    <>
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-52 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-green-600">✓ Present: {presentCount}</span>
          <span className="text-red-600">✗ Absent: {absentCount}</span>
          <span className="text-yellow-600">◷ Leave: {leaveCount}</span>
          <span className="text-gray-400">— Unmarked: {notMarked}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff Member</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Branch</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status ({selectedDate})</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Mark Attendance</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((member) => {
              const att = getAttendanceForDate(member);
              return (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{member.name || "—"}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                    {member.designation && (
                      <div className="text-xs text-blue-600 font-medium">{member.designation}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-700">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {member.branch?.name || "Global"}
                  </td>
                  <td className="px-6 py-4">
                    {att ? (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[att.status] || "bg-gray-100 text-gray-600"}`}>
                        {att.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not marked</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {["PRESENT", "ABSENT", "LEAVE"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleMark(member.id, s)}
                          disabled={loading === member.id + s}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all disabled:opacity-50 ${
                            att?.status === s
                              ? s === "PRESENT" ? "bg-green-600 text-white" : s === "ABSENT" ? "bg-red-600 text-white" : "bg-yellow-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {loading === member.id + s ? "..." : s === "PRESENT" ? "P" : s === "ABSENT" ? "A" : "L"}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setProfileUser(member); setBioMsg(null); }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bio-data Modal */}
      {profileUser && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {profileUser.name?.[0] || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{profileUser.name || "—"}</h3>
                  <p className="text-sm text-gray-500">{profileUser.email}</p>
                </div>
              </div>
              <button onClick={() => setProfileUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleBioSave} className="p-6 space-y-4">
              {bioMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${bioMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {bioMsg.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide flex items-center gap-1">
                    <Phone size={12} /> Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={profileUser.phone || ""}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide flex items-center gap-1">
                    <CreditCard size={12} /> CNIC
                  </label>
                  <input
                    type="text"
                    name="cnic"
                    defaultValue={profileUser.cnic || ""}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="35202-1234567-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide flex items-center gap-1">
                    <Briefcase size={12} /> Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    defaultValue={profileUser.designation || ""}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Senior Instructor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide flex items-center gap-1">
                    <BookOpen size={12} /> Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    defaultValue={profileUser.education || ""}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. MSc Computer Science"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide flex items-center gap-1">
                  <MapPin size={12} /> Address
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={profileUser.address || ""}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Street, City, Pakistan"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide flex items-center gap-1">
                  <UserCircle size={12} /> Bio / Notes
                </label>
                <textarea
                  name="bio"
                  defaultValue={profileUser.bio || ""}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Short bio or notes about this staff member..."
                />
              </div>

              {/* Attendance History */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Recent Attendance (last 30 days)</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profileUser.attendances.slice(0, 30).map((a) => (
                    <div
                      key={a.id}
                      title={`${new Date(a.date).toISOString().split("T")[0]}: ${a.status}`}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${statusColors[a.status] || "bg-gray-100 text-gray-400"}`}
                    >
                      {a.status[0]}
                    </div>
                  ))}
                  {profileUser.attendances.length === 0 && (
                    <p className="text-sm text-gray-400">No attendance records yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setProfileUser(null)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                  Close
                </button>
                <button
                  type="submit"
                  disabled={bioLoading}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {bioLoading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
