"use client";

import { useState } from "react";
import { resolveLeave } from "@/app/actions/leaves";
import { CheckCircle, X, Paperclip } from "lucide-react";
import Link from "next/link";

export default function HODLeaveQueueClient({ initialLeaves }: { initialLeaves: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (leaveId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
    setLoadingId(leaveId);
    
    const fd = new FormData();
    fd.append("leaveId", leaveId);
    fd.append("status", status);

    try {
      await resolveLeave(fd);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Leave Approvals</h2>
      <div className="space-y-3">
        {initialLeaves.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No pending leaves in queue.</div>
        )}
        
        {initialLeaves.map(leave => (
          <div key={leave.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{leave.user.name}</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{leave.user.role}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold text-gray-800">{leave.type} Leave:</span>{" "}
                {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
              </p>
              {leave.reason && <p className="text-sm text-gray-500 italic">"{leave.reason}"</p>}
              
              {leave.attachmentUrl && (
                <Link href={leave.attachmentUrl} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-2">
                  <Paperclip size={12} /> View Medical/Duty Proof
                </Link>
              )}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button onClick={() => handleAction(leave.id, "REJECTED")} disabled={loadingId === leave.id}
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                <X size={16} /> Reject
              </button>
              <button onClick={() => handleAction(leave.id, "APPROVED")} disabled={loadingId === leave.id}
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
