import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, ClipboardCheck, Award, Calendar } from "lucide-react";



export default async function TeacherPortal() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["HEAD_ADMIN","TEACHER","HOD"].includes(session.user.role!)) redirect("/settings");

  const teacherId = session.user.id!;

  const [myClasses, examCount, recentResults] = await Promise.all([
    prisma.classTeacher.findMany({
      where: { teacherId },
      include: { section: { include: { class: true, enrollments: true } }, course: true },
    }),
    prisma.exam.count({ where: { createdById: teacherId } }),
    prisma.testResult.findMany({
      where: { gradedById: teacherId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { student: { select: { name: true } }, exam: { select: { title: true } }, course: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-8 fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: "linear-gradient(135deg,#0c4a6e,#0369a1,#0284c7)" }}>
        <div className="absolute right-8 -top-4 opacity-10"><BookOpen size={160} className="text-white" /></div>
        <div className="relative">
          <p className="text-sky-300 text-sm font-semibold uppercase tracking-widest mb-2">Teacher Portal</p>
          <h1 className="text-3xl font-black text-white mb-1">Welcome, {session.user.name?.split(" ")[0]}</h1>
          <p className="text-sky-200 text-sm">Manage your classes, enter grades, and track student progress.</p>
          <div className="flex gap-3 mt-6">
            <Link href="/teacher/gradebook" className="flex items-center gap-2 bg-white text-sky-800 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-sky-50 transition-all">
              <Award size={14} /> Enter Grades
            </Link>
            <Link href="/teacher/attendance" className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all">
              <ClipboardCheck size={14} /> Mark Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "My Classes", value: myClasses.length, icon: BookOpen, color: "text-sky-600 bg-sky-50 border-sky-100" },
          { label: "Total Students", value: myClasses.reduce((s, c) => s + c.section.enrollments.length, 0), icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Exams Created", value: examCount, icon: Calendar, color: "text-purple-600 bg-purple-50 border-purple-100" },
          { label: "Results Entered", value: recentResults.length, icon: Award, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.color} card-lift`}>
            <s.icon size={22} className="mb-3" />
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-sm font-semibold opacity-80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">My Classes</h3>
            <Link href="/teacher/gradebook" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View Gradebook</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myClasses.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No classes assigned yet.</div>
            )}
            {myClasses.map((ct, i) => (
              <div key={ct.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg,hsl(${i*57+200},65%,50%),hsl(${i*57+240},65%,50%))` }}>
                  {ct.course.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{ct.course.name}</p>
                  <p className="text-xs text-gray-400">{ct.section.class.name} · Section {ct.section.name}</p>
                </div>
                <span className="text-xs bg-sky-50 text-sky-700 font-bold px-2 py-1 rounded-full">
                  {ct.section.enrollments.length} students
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent grades */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Recently Graded</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentResults.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No grades entered yet.</div>
            )}
            {recentResults.map((r, i) => (
              <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: `linear-gradient(135deg,hsl(${i*53+220},65%,55%),hsl(${i*53+260},65%,55%))` }}>
                  {r.student.name?.[0] || "S"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{r.student.name}</p>
                  <p className="text-xs text-gray-400">{r.course.name} · {r.exam.title}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black ${r.percentage && r.percentage >= 50 ? "text-green-600" : "text-red-500"}`}>
                    {r.grade}
                  </span>
                  <div className="text-xs text-gray-400">{r.percentage?.toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
