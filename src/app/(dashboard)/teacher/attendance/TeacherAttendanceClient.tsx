"use client";

import { useState } from "react";
import { markBulkStudentAttendance } from "@/app/actions/attendance";
import { Check, X, Clock, AlertTriangle, Search, Save } from "lucide-react";
import ModalShell from "@/components/ModalShell";

export default function TeacherAttendanceClient({ initialSections }: { initialSections: any[] }) {
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  
  const selectedSection = initialSections.find(s => s.id === selectedSectionId);
  const students = selectedSection?.enrollments.map((e: any) => e.user) || [];

  // State to hold attendance for each student in the format { studentId: status }
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});

  const setStatus = (studentId: string, status: string) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleBulkSubmit = async () => {
    if (!selectedSectionId) return alert("Select a section");
    
    // Check if any student lacks a status
    const missing = students.find((s: any) => !attendanceState[s.id]);
    if (missing) return alert("Please mark attendance for all students before submitting.");

    setLoading(true);
    try {
      const records = Object.entries(attendanceState).map(([userId, status]) => ({
        userId, status
      }));

      await markBulkStudentAttendance(selectedSectionId, selectedSection?.courseId || "", selectedDate, records);
      alert("Attendance marked successfully!");
      setAttendanceState({}); // Reset
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusIcons: any = {
    PRESENT: { icon: Check, color: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100" },
    ABSENT: { icon: X, color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100" },
    LATE: { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" },
    LEAVE: { icon: AlertTriangle, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" }
  };

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Select a class section and date to submit bulk attendance.</p>
      </div>

      <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Section</label>
          <select value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400">
            <option value="">Select Section...</option>
            {initialSections.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
        </div>
      </div>

      {selectedSectionId && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Students ({students.length})</h3>
            <button onClick={handleBulkSubmit} disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              <Save size={16} /> {loading ? "Saving..." : "Submit Attendance"}
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {students.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">No students enrolled in this section.</div>
            )}
            {students.map((student: any) => (
              <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {student.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {Object.keys(statusIcons).map(status => {
                    const isSelected = attendanceState[student.id] === status;
                    const style = statusIcons[status];
                    const Icon = style.icon;
                    return (
                      <button key={status} onClick={() => setStatus(student.id, status)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all
                          ${isSelected ? style.color + " shadow-sm border-transparent ring-2 ring-offset-1 ring-current" : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"}`}
                        title={status}
                      >
                        <Icon size={18} strokeWidth={isSelected ? 3 : 2} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
