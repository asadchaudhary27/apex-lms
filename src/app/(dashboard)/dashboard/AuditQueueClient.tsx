"use client";

import { useState } from "react";
import { resolveAuditTicket } from "@/app/actions/audit";
import { CheckCircle, X, ShieldAlert, Edit3, Trash2 } from "lucide-react";

export default function AuditQueueClient({ tickets }: { tickets: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleResolve = async (ticketId: string, status: "APPROVED" | "REJECTED") => {
    let reason = "";
    if (status === "REJECTED") {
      reason = prompt("Reason for rejection:") || "";
      if (!reason) return;
    } else {
      if (!confirm("Are you sure you want to approve this action? This will irreversibly modify the database.")) return;
    }

    setLoadingId(ticketId);
    try {
      await resolveAuditTicket(ticketId, status, reason);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Governance Audit Queue</h2>
          <p className="text-xs text-gray-500">Approve or reject data modification requests from faculty and sub-admins.</p>
        </div>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm border-2 border-dashed border-gray-100 rounded-xl">
            No pending audit tickets. Your records are secure.
          </div>
        )}

        {tickets.map(ticket => (
          <div key={ticket.id} className="p-5 border border-amber-200 rounded-xl bg-amber-50/30 flex flex-col xl:flex-row gap-6 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${ticket.actionType === "DELETE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                  {ticket.actionType === "DELETE" ? <Trash2 size={12} /> : <Edit3 size={12} />}
                  {ticket.actionType}
                </span>
                <span className="text-sm font-bold text-gray-800">{ticket.entityType} Record</span>
                <span className="text-xs text-gray-400">ID: {ticket.entityId}</span>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                Requested by <span className="font-semibold text-gray-900">{ticket.requestedBy.name} ({ticket.requestedBy.role})</span>: 
                <span className="italic ml-1">"{ticket.reason}"</span>
              </div>

              {ticket.actionType === "MODIFY" && ticket.proposedData && (
                <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-white p-3 rounded-lg border border-amber-100">
                  <div>
                    <p className="text-gray-400 mb-1 font-sans font-semibold">Original Data</p>
                    <pre className="text-gray-600 overflow-x-auto">{JSON.stringify(JSON.parse(ticket.originalData || "{}"), null, 2)}</pre>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1 font-sans font-semibold">Proposed Changes</p>
                    <pre className="text-green-600 overflow-x-auto">{JSON.stringify(JSON.parse(ticket.proposedData || "{}"), null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex xl:flex-col gap-2 justify-center w-full xl:w-32">
              <button onClick={() => handleResolve(ticket.id, "APPROVED")} disabled={loadingId === ticket.id}
                className="flex-1 xl:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle size={16} /> Approve
              </button>
              <button onClick={() => handleResolve(ticket.id, "REJECTED")} disabled={loadingId === ticket.id}
                className="flex-1 xl:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
