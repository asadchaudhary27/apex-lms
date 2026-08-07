"use client";

import { useState } from "react";
import { createFeeVoucher, recordPayment, addConcession, createFeeCategory, applyLateFees } from "@/app/actions/fees";
import { DollarSign, Plus, X, Search, CheckCircle, AlertTriangle, Clock, CreditCard, FileText } from "lucide-react";

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: any }> = {
  PAID:     { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
  UNPAID:   { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  PARTIAL:  { bg: "bg-blue-50",  text: "text-blue-700",  icon: Clock },
  OVERDUE:  { bg: "bg-red-50",   text: "text-red-700",   icon: AlertTriangle },
};

const METHODS = ["CASH","BANK","JAZZCASH","NAYAPAY","EASYPAISA","MEEZAN","TRANSFER"];

type Modal = "invoice" | "bulk" | "payment" | "concession" | "category" | null;

export default function FeeManager({ students, classes = [], categories, invoices, lateFeeRules }: any) {
  const [modal, setModal] = useState<Modal>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [items, setItems] = useState([{ feeCategoryId: "", amount: "", description: "" }]);

  const filtered = invoices.filter((inv: any) => {
    const matchSearch =
      inv.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.challanId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    
    const enrollment = inv.student?.studentEnrollments?.[0];
    const matchClass = classFilter === "" || enrollment?.section?.class?.id === classFilter;
    const matchSection = sectionFilter === "" || enrollment?.section?.id === sectionFilter;

    return matchSearch && matchStatus && matchClass && matchSection;
  });

  const selectedClass = classes.find((c: any) => c.id === classFilter);
  const availableSections = selectedClass?.sections || [];

  const filteredStudents = students.filter((s: any) => {
    const enrollment = s.studentEnrollments?.[0];
    const matchClass = classFilter === "" || enrollment?.section?.class?.id === classFilter;
    const matchSection = sectionFilter === "" || enrollment?.section?.id === sectionFilter;
    return matchClass && matchSection;
  });

  const totalCollected = invoices.filter((i: any) => i.status === "PAID")
    .reduce((s: number, i: any) => s + i.netAmount, 0);
  const totalPending = invoices.filter((i: any) => i.status !== "PAID")
    .reduce((s: number, i: any) => s + i.netAmount, 0);

  async function handleInvoice(fd: FormData) {
    setLoading(true);
    items.forEach((item, i) => {
      fd.append(`itemCategoryId_${i}`, item.feeCategoryId);
      fd.append(`itemAmount_${i}`, item.amount);
      fd.append(`itemDesc_${i}`, item.description);
    });
    try { await createFeeVoucher(fd); setModal(null); setItems([{ feeCategoryId: "", amount: "", description: "" }]); }
    catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  async function handleBulkGenerate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    setLoading(true);
    try {
      const { generateFeeVouchers } = await import("@/app/actions/finance");
      const count = await generateFeeVouchers(fd.get("classId") as string, fd.get("dueDate") as string);
      alert(`Generated ${count} invoices successfully!`);
      setModal(null);
    } catch (err: any) { alert(err.message); }
    setLoading(false);
  }

  async function handlePayment(fd: FormData) {
    setLoading(true);
    fd.append("feeVoucherId", selectedInvoice.id);
    try { await recordPayment(fd); setModal(null); setSelectedInvoice(null); }
    catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg,#065f46,#064e3b)" }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <DollarSign size={100} className="text-white" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Fee Management</h2>
            <p className="text-emerald-300 text-sm mt-1">Invoices · Payments · Concessions · Late Fees</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setModal("invoice")}
              className="flex items-center gap-2 bg-white text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all">
              <Plus size={14} /> New Invoice
            </button>
            <button onClick={() => setModal("bulk")}
              className="flex items-center gap-2 bg-emerald-700 border border-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all">
              Bulk Generate
            </button>
            <button onClick={() => setModal("concession")}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all">
              Add Concession
            </button>
            <button onClick={() => setModal("category")}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all">
              Fee Category
            </button>
            <form action={async () => { await applyLateFees(); }}>
              <button type="submit"
                className="flex items-center gap-2 bg-red-500/30 border border-red-400/40 text-red-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-500/50 transition-all">
                <AlertTriangle size={14} /> Apply Late Fees
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: invoices.length, color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Collected", value: `Rs ${totalCollected.toLocaleString()}`, color: "bg-green-50 border-green-100 text-green-700" },
          { label: "Outstanding", value: `Rs ${totalPending.toLocaleString()}`, color: "bg-amber-50 border-amber-100 text-amber-700" },
          { label: "Overdue", value: invoices.filter((i: any) => i.status === "OVERDUE").length, color: "bg-red-50 border-red-100 text-red-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="text-xl font-black">{s.value}</div>
            <div className="text-xs font-semibold mt-0.5 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name or invoice number..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all text-gray-900" />
        </div>
        <div className="flex gap-2">
          <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setSectionFilter(""); }}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 text-gray-700 font-medium">
            <option value="">All Classes</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {classFilter && (
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 text-gray-700 font-medium">
              <option value="">All Sections</option>
              {availableSections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          {["ALL","PAID","UNPAID","PARTIAL","OVERDUE"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${statusFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["Invoice #","Student","Amount","Discount","Net Due","Status","Paid","Actions"].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((inv: any) => {
              const S = STATUS_STYLE[inv.status] || STATUS_STYLE.UNPAID;
              const SIcon = S.icon;
              const paidSoFar = inv.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
              return (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-gray-600">{inv.challanId}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{inv.student?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{inv.student?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-700">Rs {inv.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-green-600">
                    {inv.discountAmount > 0 ? `-Rs ${inv.discountAmount.toLocaleString()}` : "—"}
                    {inv.penaltyAmount > 0 && <div className="text-red-500 text-xs">+Rs {inv.penaltyAmount} late fee</div>}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900">Rs {inv.netAmount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${S.bg} ${S.text}`}>
                      <SIcon size={10} /> {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">Rs {paidSoFar.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    {inv.status !== "PAID" && (
                      <button
                        onClick={() => { setSelectedInvoice(inv); setModal("payment"); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors">
                        <CreditCard size={11} /> Record Payment
                      </button>
                    )}
                    {inv.status === "PAID" && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm">No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* NEW INVOICE MODAL */}
      {modal === "invoice" && (
        <ModalShell title="Generate Fee Invoice" subtitle="Create a new fee bill for a student" onClose={() => setModal(null)}>
          <form action={handleInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Student</label>
              <select name="studentId" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400">
                <option value="">Select a student...</option>
                {filteredStudents.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
            <FLabel label="Due Date">
              <input type="date" name="dueDate" required className={inputCls} />
            </FLabel>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>Fee Items</label>
                <button type="button" onClick={() => setItems([...items, { feeCategoryId:"", amount:"", description:"" }])}
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add Item</button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-5">
                    <select value={item.feeCategoryId} onChange={e => { const n=[...items]; n[i].feeCategoryId=e.target.value; setItems(n); }}
                      className={inputCls + " text-xs"}>
                      <option value="">Category...</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input type="number" placeholder="Amount (Rs)" value={item.amount} onChange={e => { const n=[...items]; n[i].amount=e.target.value; setItems(n); }}
                      className={inputCls + " text-xs"} />
                  </div>
                  <div className="col-span-2">
                    <input placeholder="Note" value={item.description} onChange={e => { const n=[...items]; n[i].description=e.target.value; setItems(n); }}
                      className={inputCls + " text-xs"} />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems(items.filter((_,j)=>j!==i))}
                      className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <FLabel label="Notes (optional)">
              <input name="notes" placeholder="Additional notes" className={inputCls} />
            </FLabel>
            <ModalFooter onClose={() => setModal(null)} label="Generate Invoice" loading={loading} color="from-emerald-500 to-teal-600" />
          </form>
        </ModalShell>
      )}

      {/* RECORD PAYMENT MODAL */}
      {modal === "payment" && selectedInvoice && (
        <ModalShell title="Record Payment" subtitle={`Invoice: ${selectedInvoice.challanId} · Due: Rs ${selectedInvoice.netAmount.toLocaleString()}`} onClose={() => { setModal(null); setSelectedInvoice(null); }}>
          <form action={handlePayment} className="space-y-4">
            <FLabel label="Amount Received (Rs)">
              <input type="number" name="amount" step="0.01" required placeholder="0.00" className={inputCls} />
            </FLabel>
            <FLabel label="Payment Method">
              <select name="method" required className={inputCls}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FLabel>
            <FLabel label="Transaction Reference / Slip No">
              <input name="reference" placeholder="Bank slip or JazzCash TID" className={inputCls} />
            </FLabel>
            <FLabel label="Notes">
              <input name="notes" placeholder="Any additional notes" className={inputCls} />
            </FLabel>
            <ModalFooter onClose={() => { setModal(null); setSelectedInvoice(null); }} label="Record Payment" loading={loading} color="from-indigo-500 to-purple-600" />
          </form>
        </ModalShell>
      )}

      {/* BULK GENERATE VOUCHERS MODAL */}
      {modal === "bulk" && (
        <ModalShell title="Bulk Generate Vouchers" onClose={() => setModal(null)}>
          <form onSubmit={handleBulkGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class</label>
              <select name="classId" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white outline-none focus:border-indigo-500">
                <option value="">Select Class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Requires active fee structures for this class.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
              <input type="date" name="dueDate" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white outline-none focus:border-indigo-500" />
            </div>
            <button disabled={loading} type="submit" className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700">
              {loading ? "Generating..." : "Generate Vouchers"}
            </button>
          </form>
        </ModalShell>
      )}

      {/* CONCESSION MODAL */}
      {modal === "concession" && (
        <ModalShell title="Apply Concession" subtitle="Scholarship or discount for a student" onClose={() => setModal(null)}>
          <form action={async (fd) => { setLoading(true); try { await addConcession(fd); setModal(null); } catch(e:any){alert(e.message);} setLoading(false); }} className="space-y-4">
            <FLabel label="Select Student">
              <select name="studentId" required className={inputCls}>
                <option value="">Choose student...</option>
                {students.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FLabel>
            <div className="grid grid-cols-2 gap-4">
              <FLabel label="Type">
                <select name="type" required className={inputCls}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (Rs)</option>
                </select>
              </FLabel>
              <FLabel label="Value">
                <input type="number" name="value" step="0.01" required placeholder="e.g. 25" className={inputCls} />
              </FLabel>
            </div>
            <FLabel label="Reason">
              <select name="reason" required className={inputCls}>
                {["SCHOLARSHIP","SIBLING","MERIT","NEED_BASED","STAFF_CHILD"].map(r=><option key={r} value={r}>{r.replace("_"," ")}</option>)}
              </select>
            </FLabel>
            <FLabel label="Valid Until (optional)">
              <input type="date" name="validTo" className={inputCls} />
            </FLabel>
            <ModalFooter onClose={() => setModal(null)} label="Apply Concession" loading={loading} color="from-purple-500 to-indigo-600" />
          </form>
        </ModalShell>
      )}

      {/* FEE CATEGORY MODAL */}
      {modal === "category" && (
        <ModalShell title="New Fee Category" subtitle="Define a fee type (e.g. Tuition, Lab)" onClose={() => setModal(null)}>
          <form action={async(fd)=>{setLoading(true);try{await createFeeCategory(fd);setModal(null);}catch(e:any){alert(e.message);}setLoading(false);}} className="space-y-4">
            <FLabel label="Category Name">
              <input name="name" required placeholder="e.g. Tuition Fee" className={inputCls} />
            </FLabel>
            <FLabel label="Description">
              <input name="description" placeholder="Short description" className={inputCls} />
            </FLabel>
            <div className="grid grid-cols-2 gap-4">
              <FLabel label="Recurring?">
                <select name="isRecurring" className={inputCls}>
                  <option value="true">Yes (recurring)</option>
                  <option value="false">No (one-time)</option>
                </select>
              </FLabel>
              <FLabel label="Frequency">
                <select name="frequency" className={inputCls}>
                  {["MONTHLY","TERM","ANNUAL","ONE_TIME"].map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </FLabel>
            </div>
            <ModalFooter onClose={() => setModal(null)} label="Create Category" loading={loading} color="from-slate-600 to-gray-700" />
          </form>
        </ModalShell>
      )}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────
const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all";
const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2";

function FLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function ModalShell({ title, subtitle, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto sm:pt-10  z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onClose, label, loading, color }: any) {
  return (
    <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
      <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
      <button type="submit" disabled={loading} className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 bg-gradient-to-r ${color}`}>
        {loading ? "Processing..." : label}
      </button>
    </div>
  );
}
