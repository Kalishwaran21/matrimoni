import React, { useEffect, useState } from "react";
import { Check, X, Search, IndianRupee } from "lucide-react";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";

export default function AdminPayments() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/subscriptions/pending")
      .then(({ data }) => {
        setPending(data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load pending payments.");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    if (!window.confirm("Are you sure you want to approve this payment?")) return;
    try {
      await api.patch(`/admin/subscriptions/${id}/approve`);
      toast.success("Payment approved successfully!");
      load();
    } catch {
      toast.error("Approval action failed.");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this payment?")) return;
    try {
      await api.patch(`/admin/subscriptions/${id}/reject`);
      toast.success("Payment rejected successfully!");
      load();
    } catch {
      toast.error("Reject action failed.");
    }
  };

  const filtered = pending.filter((p) => {
    const name = p.user?.fullName || "";
    const email = p.user?.email || "";
    const txn = p.transactionId || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      txn.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="label">Admin Desk</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Payment Approvals
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review and approve pending GPay transactions.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or txn ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-maroon-300 focus:bg-white focus:ring-4 focus:ring-maroon-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm font-medium text-slate-600">
          Pending: <span className="text-maroon-600">{pending.length}</span>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div key={p._id} className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-maroon-50 text-maroon-600">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{p.user?.fullName}</h3>
                  <p className="text-sm text-slate-500">{p.user?.email}</p>
                  <p className="text-sm text-slate-500">{p.user?.mobile}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold text-maroon-700">{p.plan} (₹{p.amount})</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Txn ID:</span>
                  <span className="font-mono bg-slate-100 px-2 rounded">{p.transactionId}</span>
                </div>
                {p.screenshotUrl && (
                  <div className="mt-4 text-center">
                    <a href={p.screenshotUrl} target="_blank" rel="noreferrer" className="text-sm text-maroon-600 hover:underline">
                      View Screenshot
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => approve(p._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => reject(p._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-500">
            No pending payments found.
          </div>
        )}
      </div>
    </div>
  );
}
