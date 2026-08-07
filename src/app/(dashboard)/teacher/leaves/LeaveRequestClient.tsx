"use client";

import { useState } from "react";
import { requestLeave } from "@/app/actions/leaves";
import { Plus, X, FileText, CheckCircle, Clock, AlertTriangle, Paperclip } from "lucide-react";
import ModalShell from "@/components/ModalShell";
import Link from "next/link";

export default function LeaveRequestClient({ initialLeaves }: { initialLeaves: any[] }) {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRequest(fd: FormData) {
    setLoading(true);
    try {
      await requestLeave(fd);
      setModal(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "APPROVED") return <CheckCircle size={16} className="text-green-600" />;
    if (status === "REJECTED") return <X size={16} className="text-red-600" />;
    return <Clock size={16} className="text-amber-600" />;
  };

  const getStatusBg = (status: string) => {
    if (status === "APPROVED") return "bg-green-50 text-green-700 border-green-200";
    if (status === "REJECTED") return "bg-red-50 text-red-700 border-red-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="space-y-6 fade-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Submit and track your leave applications.</p>
        </div>
        <button onClick={() => setModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Attachment</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialLeaves.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No leave requests found.</td></tr>
            )}
            {initialLeaves.map(leave => (
              <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">{leave.type}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{leave.reason || "N/A"}</td>
                <td className="px-6 py-4">
                  {leave.attachmentUrl ? (
                    <Link href={leave.attachmentUrl} target="_blank" className="flex items-center gap-1 text-indigo-600 hover:underline">
                      <Paperclip size={14} /> View
                    </Link>
                  ) : <span className="text-gray-400">None</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-max ${getStatusBg(leave.status)}`}>
                    {getStatusIcon(leave.status)} {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <ModalShell title="Submit Leave Request" subtitle="Fill out the details below" onClose={() => setModal(false)}>
          <form action={handleRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Leave Type</label>
              <select name="type" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400">
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="DUTY">Duty Leave</option>
                <option value="MATERNITY">Maternity/Paternity Leave</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Start Date</label>
                <input type="date" name="startDate" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">End Date</label>
                <input type="date" name="endDate" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Reason</label>
              <textarea name="reason" rows={3} required placeholder="Explain why you need this leave..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Supporting Document (Optional)</label>
              <input type="file" name="attachment" accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              <p className="text-xs text-gray-400 mt-1">Medical certificates or duty approval forms.</p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                {loading && <Clock size={16} className="animate-spin" />} Submit Request
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
