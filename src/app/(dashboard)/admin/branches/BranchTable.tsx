"use client";

import { useState } from "react";
import { createBranch, deleteBranch } from "@/app/actions/branches";

export default function BranchTable({ branches }: { branches: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      await createBranch(formData);
      setShowModal(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Branch Management</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Branch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Branch Name</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Currency</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Timezone</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {branches.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                <td className="px-6 py-4 text-gray-600">{b.address || "-"}</td>
                <td className="px-6 py-4 text-gray-600">{b.currency}</td>
                <td className="px-6 py-4 text-gray-600">{b.timezone}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => deleteBranch(b.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No branches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md shrink-0 my-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Branch</h3>
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" name="address" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input type="text" name="currency" defaultValue="USD" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <input type="text" name="timezone" defaultValue="UTC" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : "Save Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
