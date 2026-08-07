"use client";

import { useState } from "react";
import { saveExam, submitResults } from "@/app/actions/gradebook";
import { Plus, X, Award, BookOpen, Send } from "lucide-react";

const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all";
const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2";

const GRADE_COLOR: Record<string, string> = {
  "A+": "text-purple-700 bg-purple-50", "A": "text-indigo-700 bg-indigo-50",
  "B+": "text-blue-700 bg-blue-50", "B": "text-cyan-700 bg-cyan-50",
  "C": "text-amber-700 bg-amber-50", "D": "text-orange-700 bg-orange-50",
  "F": "text-red-700 bg-red-50",
};

export default function GradebookClient({ myClasses, exams, teacherId }: any) {
  const [showExamModal, setShowExamModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(myClasses[0] || null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const classExams = exams.filter((e: any) => e.sectionId === selectedClass?.section?.id);

  async function handleExam(fd: FormData) {
    setLoading(true);
    if (selectedClass) {
      fd.append("sectionId", selectedClass.section.id);
      fd.append("courseId", selectedClass.course.id);
    }
    try { await saveExam(fd); setShowExamModal(false); } catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  async function handleResults() {
    if (!showResultModal) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("examId", showResultModal.id);
    const students = selectedClass?.section?.enrollments || [];
    students.forEach((en: any) => {
      fd.append("studentId", en.student.id);
      fd.append("marks", marks[en.student.id] || "0");
    });
    try { await submitResults(fd); setShowResultModal(null); setMarks({}); } catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Gradebook</h2>
          <p className="text-gray-400 text-sm mt-1">Create exams and enter student marks</p>
        </div>
        <div className="flex gap-3">
          {myClasses.length > 1 && (
            <select value={selectedClass?.id || ""} onChange={e => setSelectedClass(myClasses.find((c: any) => c.id === e.target.value))}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-300 text-gray-700">
              {myClasses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.course.name} · {c.section.class.name}-{c.section.name}</option>
              ))}
            </select>
          )}
          <button onClick={() => setShowExamModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Plus size={14} /> New Exam
          </button>
        </div>
      </div>

      {/* Exams list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classExams.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
            <BookOpen size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No exams yet for this class</p>
            <p className="text-sm mt-1">Create your first exam to start entering grades</p>
          </div>
        )}
        {classExams.map((exam: any) => {
          const graded = exam.testResults.length;
          const students = selectedClass?.section?.enrollments?.length || 0;
          return (
            <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-lift">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{exam.type}</span>
                <span className="text-xs text-gray-400">{new Date(exam.date).toISOString().split("T")[0]}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{exam.title}</h4>
              <p className="text-sm text-gray-500 mb-4">Total Marks: <span className="font-semibold text-gray-700">{exam.totalMarks}</span> · Pass: {exam.passingMarks}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">{graded}/{students} graded</div>
                <button onClick={() => { setShowResultModal(exam); setMarks({}); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors">
                  <Award size={12} /> Enter Marks
                </button>
              </div>
              {/* progress bar */}
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full transition-all"
                  style={{ width: students > 0 ? `${(graded/students)*100}%` : "0%" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Exam Modal */}
      {showExamModal && (
        <ModalShell title="Create New Exam" subtitle={selectedClass ? `${selectedClass.course.name} · ${selectedClass.section.class.name}-${selectedClass.section.name}` : ""} onClose={() => setShowExamModal(false)}>
          <form action={handleExam} className="space-y-4">
            <div><label className={labelCls}>Exam Title</label><input name="title" required placeholder="e.g. Chapter 3 Test" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Type</label>
                <select name="type" className={inputCls}>
                  {["TEST","QUIZ","ASSIGNMENT","MID_TERM","FINAL"].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Date</label><input type="date" name="date" required className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Total Marks</label><input type="number" name="totalMarks" required defaultValue="100" className={inputCls} /></div>
              <div><label className={labelCls}>Passing Marks</label><input type="number" name="passingMarks" required defaultValue="33" className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Venue (optional)</label><input name="venue" placeholder="Room 101" className={inputCls} /></div>
            <ModalFooter onClose={() => setShowExamModal(false)} label="Create Exam" loading={loading} />
          </form>
        </ModalShell>
      )}

      {/* Enter Marks Modal */}
      {showResultModal && (
        <ModalShell title="Enter Student Marks" subtitle={`${showResultModal.title} · Total: ${showResultModal.totalMarks}`} onClose={() => { setShowResultModal(null); setMarks({}); }}>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {(selectedClass?.section?.enrollments || []).map((en: any, i: number) => {
              const mark = marks[en.student.id] || "";
              const pct = showResultModal.totalMarks > 0 && mark ? (parseFloat(mark) / showResultModal.totalMarks) * 100 : null;
              const grade = pct !== null ? toGrade(pct) : null;
              return (
                <div key={en.student.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg,hsl(${i*53+210},60%,55%),hsl(${i*53+250},60%,55%))` }}>
                    {en.student.name?.[0] || "S"}
                  </div>
                  <div className="flex-1 text-sm font-semibold text-gray-800 truncate">{en.student.name}</div>
                  <input type="number" min="0" max={showResultModal.totalMarks} value={mark}
                    onChange={e => setMarks(m => ({ ...m, [en.student.id]: e.target.value }))}
                    className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-indigo-400 text-gray-900"
                    placeholder="0" />
                  {grade && (
                    <span className={`w-10 text-center text-xs font-black px-2 py-1 rounded-lg ${GRADE_COLOR[grade] || ""}`}>{grade}</span>
                  )}
                </div>
              );
            })}
            {(selectedClass?.section?.enrollments || []).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No students in this section.</p>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
            <button onClick={() => { setShowResultModal(null); setMarks({}); }} className="px-4 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
            <button onClick={handleResults} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Send size={14} /> {loading ? "Saving..." : "Submit Grades"}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function toGrade(pct: number) {
  if (pct >= 90) return "A+"; if (pct >= 80) return "A"; if (pct >= 70) return "B+";
  if (pct >= 60) return "B"; if (pct >= 50) return "C"; if (pct >= 40) return "D";
  return "F";
}

function ModalShell({ title, subtitle, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 sticky top-0 bg-white">
          <div><h3 className="font-bold text-gray-900">{title}</h3><p className="text-xs text-gray-400 mt-0.5">{subtitle}</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onClose, label, loading }: any) {
  return (
    <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
      <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
      <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
        {loading ? "Saving..." : label}
      </button>
    </div>
  );
}
