"use client";

import { useState } from "react";
import { createCourse } from "@/app/actions/courses";

export default function CourseTable({ courses, departments }: { courses: any[], departments: any[] }) {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreateCourse(formData: FormData) {
    setLoading(true);
    try {
      await createCourse(formData);
      setShowCourseModal(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 fade-up">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Course Catalog</h2>
          <p className="text-gray-400 text-sm">Manage courses offered by departments</p>
        </div>
        <button 
          onClick={() => setShowCourseModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          + New Course
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Course Name</th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Credits</th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Marks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{c.name}</div>
                  <div className="text-xs font-normal text-gray-500 truncate max-w-xs">{c.description}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono text-sm">{c.code || "-"}</td>
                <td className="px-6 py-4 text-gray-600 font-medium">
                  {c.department ? c.department.name : <span className="text-gray-400">General</span>}
                </td>
                <td className="px-6 py-4 text-gray-600">{c.creditHours}</td>
                <td className="px-6 py-4 text-gray-600">{c.totalMarks}</td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No courses found in catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-1 text-gray-900">Create Course</h3>
            <p className="text-gray-400 text-sm mb-6">Add a new course to the curriculum</p>
            <form action={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Course Name</label>
                <input name="name" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Code</label>
                  <input name="code" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Department</label>
                  <select name="departmentId" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                    <option value="">(None)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Credit Hours</label>
                  <input type="number" name="creditHours" defaultValue={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Marks</label>
                  <input type="number" name="totalMarks" defaultValue={100} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</label>
                <textarea name="description" rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-semibold">
                  {loading ? "Creating..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
