"use client";

import { useState } from "react";
import { requestLeave, resolveLeave } from "@/app/actions/leaves";

export default function LeaveTable({ leaves, currentUserRole }: { leaves: any[], currentUserRole: string }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRequest(formData: FormData) {
    setLoading(true);
    try {
      await requestLeave(formData);
      setShowModal(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  async function handleResolve(leaveId: string, status: string) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
    
    const formData = new FormData();
    formData.append("leaveId", leaveId);
    formData.append("status", status);
    
    try {
      await resolveLeave(formData);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Leave Management</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Request Leave
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{l.user?.name || l.user?.email}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{l.reason || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    l.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    l.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {l.status === 'PENDING' && (currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'BRANCH_ADMIN' || currentUserRole === 'HR') && (
                    <>
                      <button onClick={() => handleResolve(l.id, "APPROVED")} className="text-green-600 hover:text-green-800 font-medium text-sm">Approve</button>
                      <button onClick={() => handleResolve(l.id, "REJECTED")} className="text-red-600 hover:text-red-800 font-medium text-sm">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md shrink-0 my-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Request Leave</h3>
            <form action={handleRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="startDate" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" name="endDate" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea rows={3} name="reason" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
