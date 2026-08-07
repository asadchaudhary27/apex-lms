"use client";

import { useState } from "react";
import { logExpense } from "@/app/actions/expenses";
import { Plus, CheckCircle, AlertTriangle, FileText, ArrowDownRight } from "lucide-react";
import ModalShell from "@/components/ModalShell";

export default function ExpenseManager({ expenses, userId }: any) {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalExpenses = expenses.reduce((s: number, e: any) => s + e.amount, 0);

  async function handleLogExpense(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    setLoading(true);
    try {
      await logExpense(fd);
      alert("Expense logged successfully!");
      setModal(false);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg,#92400e,#78350f)" }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <ArrowDownRight size={100} className="text-white" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Institutional Expenses</h2>
            <p className="text-amber-200 text-sm mt-1">Track daily petty cash, utilities, and maintenance</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(true)}
              className="flex items-center gap-2 bg-white text-amber-900 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-50 transition-all">
              <Plus size={16} strokeWidth={3} /> Log Expense
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-semibold mb-1">Total Logged Expenses</p>
          <p className="text-2xl font-black text-red-600">Rs {totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-700">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{expense.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{expense.description}</td>
                  <td className="px-6 py-4 font-black text-red-600">-Rs {expense.amount.toLocaleString()}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={4} className="py-16 text-center text-gray-400 text-sm">No expenses logged yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ModalShell title="Log Institutional Expense" onClose={() => setModal(false)}>
          <form onSubmit={handleLogExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <select name="category" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500">
                <option value="UTILITIES">Utilities (Electricity, Water, Internet)</option>
                <option value="MAINTENANCE">Maintenance & Repairs</option>
                <option value="EVENTS">Events & Activities</option>
                <option value="MISC">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount (Rs)</label>
              <input type="number" step="0.01" name="amount" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
              <input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
              <input type="text" name="description" required placeholder="e.g. Paid K-Electric Bill for August" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500" />
            </div>
            <button disabled={loading} type="submit" className="w-full mt-6 bg-amber-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-700">
              {loading ? "Logging..." : "Log Expense"}
            </button>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
