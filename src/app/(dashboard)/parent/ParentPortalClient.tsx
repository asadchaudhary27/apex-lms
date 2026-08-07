"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, AlertTriangle, CheckCircle, Clock, Award, BookOpen } from "lucide-react";

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: any }> = {
  PAID:    { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
  UNPAID:  { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  PARTIAL: { bg: "bg-blue-50",  text: "text-blue-700",  icon: Clock },
  OVERDUE: { bg: "bg-red-50",   text: "text-red-700",   icon: AlertTriangle },
};

export default function ParentPortalClient({ links, parentName }: any) {
  const [activeChild, setActiveChild] = useState(0);
  const child = links[activeChild]?.student;

  if (!child) return null;

  const avgPct = child.testResults.length > 0
    ? Math.round(child.testResults.reduce((s: number, r: any) => s + (r.percentage || 0), 0) / child.testResults.length)
    : 0;

  const overdueCount = child.feeInvoices.filter((i: any) => i.status === "OVERDUE").length;

  const attendanceStats = child.attendances.reduce(
    (acc: any, a: any) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  const chartData = child.testResults.slice().reverse().map((r: any) => ({
    name: r.course.name.split(" ")[0],
    score: Math.round(r.percentage || 0),
  }));

  return (
    <div className="space-y-8 fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af,#1d4ed8)" }}>
        <div className="absolute right-8 opacity-10"><Users size={140} className="text-white" /></div>
        <div className="relative">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-2">Parent Portal</p>
          <h1 className="text-3xl font-black text-white mb-1">Hello, {parentName.split(" ")[0]}</h1>
          <p className="text-blue-200 text-sm">Monitor your child's academic performance and fee status.</p>
          {overdueCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-2.5 rounded-xl">
              <AlertTriangle size={14} />
              {child.name} has {overdueCount} overdue fee{overdueCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Child selector (if multiple children) */}
      {links.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {links.map((link: any, i: number) => (
            <button key={link.id} onClick={() => setActiveChild(i)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                activeChild === i
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg,hsl(${i*80+200},60%,55%),hsl(${i*80+240},60%,55%))` }}>
                {link.student.name?.[0] || "S"}
              </div>
              {link.student.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Score", value: `${avgPct}%`, icon: Award, color: "text-purple-600 bg-purple-50 border-purple-100" },
          { label: "Tests Taken", value: child.testResults.length, icon: BookOpen, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Present Days", value: attendanceStats.PRESENT || 0, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Absent Days", value: attendanceStats.ABSENT || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 card-lift ${s.color}`}>
            <s.icon size={22} className="mb-3" />
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-sm font-semibold opacity-80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Scores Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-1">{child.name}'s Test Scores</h3>
          <p className="text-xs text-gray-400 mb-5">Recent performance by subject</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v: any) => [`${v}%`, "Score"]} />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No test data yet</div>
          )}
        </div>

        {/* Fee Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Fee Invoices</h3>
            <p className="text-xs text-gray-400 mt-0.5">Recent bills for {child.name}</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {child.feeInvoices.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">No invoices</div>
            )}
            {child.feeInvoices.map((inv: any) => {
              const S = STATUS_STYLE[inv.status] || STATUS_STYLE.UNPAID;
              const SIcon = S.icon;
              return (
                <div key={inv.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-gray-500">{inv.invoiceNo}</p>
                    <p className="font-bold text-gray-900 text-sm">Rs {inv.netAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Due: {new Date(inv.dueDate).toISOString().split("T")[0]}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${S.bg} ${S.text}`}>
                    <SIcon size={10} /> {inv.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attendance grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-1">Attendance History</h3>
        <p className="text-xs text-gray-400 mb-4">Last 30 records</p>
        <div className="flex flex-wrap gap-2">
          {child.attendances.map((a: any, i: number) => (
            <div key={a.id || i} title={`${a.date ? new Date(a.date).toISOString().split("T")[0] : ""}: ${a.status}`}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-default transition-all hover:scale-110 ${
                a.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" :
                a.status === "ABSENT"  ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              }`}>
              {a.status === "PRESENT" ? "P" : a.status === "ABSENT" ? "A" : "L"}
            </div>
          ))}
          {child.attendances.length === 0 && <p className="text-gray-400 text-sm">No attendance records yet.</p>}
        </div>
      </div>
    </div>
  );
}
