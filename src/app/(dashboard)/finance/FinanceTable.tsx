"use client";

import { useState } from "react";
import { generateInvoice, processPayment } from "@/app/actions/finance";

export default function FinanceTable({ invoices, users }: { invoices: any[], users: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState("FEE"); // FEE or PAYROLL
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showDefaulters, setShowDefaulters] = useState(false);

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = (i.user?.name || i.user?.email || "").toLowerCase().includes(search.toLowerCase());
    const isDefaulter = showDefaulters ? (i.status === "PENDING" && i.dueDate && new Date(i.dueDate) < new Date()) : true;
    return matchesSearch && isDefaulter;
  });

  const exportCSV = () => {
    const headers = ["Type", "Name", "Amount", "Status", "Due Date"];
    const rows = filteredInvoices.map(i => [
      i.type,
      i.user?.name || i.user?.email || "",
      i.amount,
      i.status,
      i.dueDate ? new Date(i.dueDate).toLocaleDateString() : ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finance_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingFees = invoices.filter(i => i.type === "FEE" && i.status === "PENDING").reduce((sum, i) => sum + i.amount, 0);
  const pendingPayroll = invoices.filter(i => i.type === "PAYROLL" && i.status === "PENDING").reduce((sum, i) => sum + i.amount, 0);

  async function handleGenerate(formData: FormData) {
    setLoading(true);
    formData.append("type", invoiceType);
    try {
      await generateInvoice(formData);
      setShowModal(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  async function handlePay(invoiceId: string) {
    if (!confirm("Confirm payment processing?")) return;
    
    const formData = new FormData();
    formData.append("invoiceId", invoiceId);
    
    try {
      await processPayment(formData);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Finance Ledger</h2>
          <input 
            type="text" 
            placeholder="Search records..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer">
            <input type="checkbox" checked={showDefaulters} onChange={(e) => setShowDefaulters(e.target.checked)} className="rounded" />
            Show Defaulters
          </label>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
          >
            Export CSV
          </button>
          <button 
            onClick={() => { setInvoiceType("FEE"); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            + Student Fee
          </button>
          <button 
            onClick={() => { setInvoiceType("PAYROLL"); setShowModal(true); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
          >
            + Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-semibold mb-2">Total Receivables (Pending Fees)</h3>
          <p className="text-3xl font-bold text-gray-900">Rs {pendingFees.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-semibold mb-2">Total Liability (Pending Payroll)</h3>
          <p className="text-3xl font-bold text-gray-900">Rs {pendingPayroll.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Recipient / Payer</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInvoices.map((inv) => {
              const isPastDue = inv.status === 'PENDING' && inv.dueDate && new Date(inv.dueDate) < new Date();
              return (
              <tr key={inv.id} className={`hover:bg-gray-50 transition-colors ${isPastDue ? 'bg-red-50/50' : ''}`}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${inv.type === 'FEE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {inv.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{inv.user?.name || inv.user?.email}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">Rs {inv.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                  {isPastDue && <span className="ml-2 text-xs font-bold text-red-600">(Overdue)</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {inv.status === 'PENDING' && (
                    <button 
                      onClick={() => handlePay(inv.id)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
                    >
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            )})}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No financial records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md shrink-0 my-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {invoiceType === "FEE" ? "Generate Student Fee" : "Process Employee Payroll"}
            </h3>
            <form action={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select name="userId" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose...</option>
                  {users.filter(u => invoiceType === "FEE" ? u.role === "STUDENT" : u.role !== "STUDENT").map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (Rs)</label>
                <input type="number" step="0.01" name="amount" required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {invoiceType === "FEE" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Due Date</label>
                    <input type="date" name="dueDate" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Installments (Months)</label>
                    <input type="number" name="installments" min="1" defaultValue="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? "Processing..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
