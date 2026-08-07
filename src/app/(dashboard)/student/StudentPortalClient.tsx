"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { Award, DollarSign, BookOpen, Bell, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
  PAID:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-100", icon: CheckCircle, label: "Paid" },
  UNPAID:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-100", icon: Clock,        label: "Unpaid" },
  PARTIAL: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100",  icon: Clock,        label: "Partial" },
  OVERDUE: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-100",   icon: AlertTriangle,label: "Overdue" },
};

const GRADE_COLOR: Record<string, string> = {
  "A+":"text-purple-700","A":"text-indigo-700","B+":"text-blue-700",
  "B":"text-cyan-700","C":"text-amber-700","D":"text-orange-700","F":"text-red-600",
};

export default function StudentPortalClient({
  studentName, results, chartData, invoices, enrollments, announcements, avgPercentage
}: any) {
  const pendingFees = invoices.filter((i: any) => i.status !== "PAID").length;
  const overdueFees = invoices.filter((i: any) => i.status === "OVERDUE").length;

  const radarData = results.slice(-6).map((r: any) => ({
    subject: r.course.name.split(" ")[0],
    score: Math.round(r.percentage || 0),
    fullMark: 100,
  }));

  return (
    <div className="space-y-8 fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: "linear-gradient(135deg,#4c1d95,#6d28d9,#7c3aed)" }}>
        <div className="absolute -right-8 -top-8 opacity-10"><BookOpen size={160} className="text-white" /></div>
        <div className="relative">
          <p className="text-violet-300 text-sm font-semibold uppercase tracking-widest mb-2">Student Portal</p>
          <h1 className="text-3xl font-black text-white mb-1">{studentName}</h1>
          <p className="text-violet-200 text-sm">Your academic performance and fee status at a glance.</p>
          {overdueFees > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-2 rounded-xl">
              <AlertTriangle size={14} />
              {overdueFees} overdue fee{overdueFees !== 1 ? "s" : ""} — please pay immediately
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overall Average", value: `${avgPercentage}%`, icon: Award, color: "text-purple-600 bg-purple-50 border-purple-100" },
          { label: "Tests Taken", value: results.length, icon: BookOpen, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Pending Fees", value: pendingFees, icon: DollarSign, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Classes", value: enrollments.length, icon: Bell, color: "text-sky-600 bg-sky-50 border-sky-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 card-lift ${s.color}`}>
            <s.icon size={22} className="mb-3" />
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-sm font-semibold opacity-80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area chart - performance trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">Performance Trend</h3>
            <p className="text-xs text-gray-400 mb-5">Score percentage over time</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v: any) => [`${v}%`, "Score"]}
                />
                <Area type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: "#6366f1", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart - subject breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">Subject Performance</h3>
            <p className="text-xs text-gray-400 mb-5">Breakdown by subject</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Fee Status</h3>
            <span className="text-xs text-gray-400">{invoices.length} invoices</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {invoices.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No fee invoices yet.</div>
            )}
            {invoices.map((inv: any) => {
              const S = STATUS_STYLE[inv.status] || STATUS_STYLE.UNPAID;
              const SIcon = S.icon;
              const paid = inv.payments.reduce((s: number, p: any) => s + p.amount, 0);
              return (
                <div key={inv.id} className={`px-5 py-4 border-l-4 ${inv.status === "OVERDUE" ? "border-l-red-400" : inv.status === "PAID" ? "border-l-green-400" : "border-l-amber-400"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-gray-500">{inv.invoiceNo}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${S.bg} ${S.text}`}>
                      <SIcon size={9} /> {S.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-900">Rs {inv.netAmount.toLocaleString()}</span>
                      {paid > 0 && <span className="text-xs text-gray-400 ml-2">(Paid: Rs {paid.toLocaleString()})</span>}
                    </div>
                    <span className="text-xs text-gray-400">Due: {new Date(inv.dueDate).toISOString().split("T")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Recent Test Results</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {results.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No results yet.</div>
            )}
            {results.slice(0, 8).map((r: any) => (
              <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{r.exam.title}</p>
                  <p className="text-xs text-gray-400">{r.course.name} · {new Date(r.exam.date).toISOString().split("T")[0]}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${GRADE_COLOR[r.grade || ""] || "text-gray-700"}`}>{r.grade}</div>
                  <div className="text-xs text-gray-400">{r.marksObtained}/{r.exam.totalMarks}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-indigo-500" />
            <h3 className="font-bold text-gray-900">Announcements</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {announcements.map((a: any) => (
              <div key={a.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.body}</p>
                    <p className="text-[10px] text-gray-400 mt-2">By {a.author.name} · {new Date(a.createdAt).toISOString().split("T")[0]}</p>
                  </div>
                  {a.pinned && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold shrink-0">Pinned</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
