"use client";

import { useState } from "react";
import { createModule, createLesson, createQuestion } from "@/app/actions/content";
import Link from "next/link";

export default function BuilderUI({ course }: { course: any }) {
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState<string | null>(null); // moduleId
  const [showQuestionModal, setShowQuestionModal] = useState<string | null>(null); // lessonId
  const [loading, setLoading] = useState(false);

  async function handleModule(formData: FormData) {
    setLoading(true);
    formData.append("courseId", course.id);
    try {
      await createModule(formData);
      setShowModuleModal(false);
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  async function handleLesson(formData: FormData) {
    setLoading(true);
    formData.append("courseId", course.id);
    formData.append("moduleId", showLessonModal as string);
    try {
      await createLesson(formData);
      setShowLessonModal(null);
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  async function handleQuestion(formData: FormData) {
    setLoading(true);
    formData.append("courseId", course.id);
    formData.append("lessonId", showQuestionModal as string);
    try {
      await createQuestion(formData);
      setShowQuestionModal(null);
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <Link href="/courses" className="text-sm text-blue-600 hover:underline mb-1 inline-block">&larr; Back to Catalog</Link>
          <h2 className="text-2xl font-bold text-gray-800">Course Builder: {course.title}</h2>
        </div>
        <button 
          onClick={() => setShowModuleModal(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          + Add Module
        </button>
      </div>

      <div className="space-y-4">
        {course.modules?.map((mod: any) => (
          <div key={mod.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{mod.title}</h3>
              <button onClick={() => setShowLessonModal(mod.id)} className="text-sm text-blue-600 font-medium hover:underline">+ Add Lesson</button>
            </div>
            <div className="divide-y divide-gray-100">
              {mod.lessons?.map((les: any) => (
                <div key={les.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <span className={`inline-block w-16 text-xs font-bold px-2 py-1 rounded mr-3 text-center ${
                      les.type === 'VIDEO' ? 'bg-red-100 text-red-700' :
                      les.type === 'QUIZ' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{les.type}</span>
                    <span className="font-medium text-gray-800">{les.title}</span>
                  </div>
                  {les.type === 'QUIZ' && (
                    <button onClick={() => setShowQuestionModal(les.id)} className="text-sm text-purple-600 font-medium hover:underline">
                      + Add Question ({les.questions?.length || 0})
                    </button>
                  )}
                </div>
              ))}
              {(!mod.lessons || mod.lessons.length === 0) && (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">No lessons in this module yet.</div>
              )}
            </div>
          </div>
        ))}
        {(!course.modules || course.modules.length === 0) && (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300 text-gray-500">
            This course is empty. Add a module to get started.
          </div>
        )}
      </div>

      {/* Modals */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create Module</h3>
            <form action={handleModule} className="space-y-4">
              <input type="text" name="title" placeholder="Module Title" required className="w-full border rounded-lg px-3 py-2" />
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModuleModal(false)}>Cancel</button><button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create Lesson</h3>
            <form action={handleLesson} className="space-y-4">
              <input type="text" name="title" placeholder="Lesson Title" required className="w-full border rounded-lg px-3 py-2" />
              <select name="type" className="w-full border rounded-lg px-3 py-2">
                <option value="VIDEO">Video</option>
                <option value="TEXT">Text/Article</option>
                <option value="QUIZ">Quiz</option>
              </select>
              <input type="url" name="videoUrl" placeholder="Video URL (Optional)" className="w-full border rounded-lg px-3 py-2" />
              <textarea name="content" placeholder="Text Content (Optional)" rows={3} className="w-full border rounded-lg px-3 py-2" />
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowLessonModal(null)}>Cancel</button><button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Quiz Question</h3>
            <form action={handleQuestion} className="space-y-4">
              <textarea name="text" placeholder="Question Text" required className="w-full border rounded-lg px-3 py-2" />
              <input type="text" name="options" placeholder='Options as JSON: ["A", "B", "C"]' required className="w-full border rounded-lg px-3 py-2" />
              <input type="text" name="answer" placeholder="Correct Answer (Exact match)" required className="w-full border rounded-lg px-3 py-2" />
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowQuestionModal(null)}>Cancel</button><button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
