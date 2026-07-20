import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, CheckCircle2, XCircle, Mail, Phone, Calendar, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import { CardSkeleton } from "../components/Spinner";

export default function AdminClientInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  const fetchInterests = () => {
    api.get("/admin/client-interests").then(({ data }) => {
      setInterests(data.interests || []);
      setLoading(false);
    }).catch(() => {
      toast.error("Failed to load client interests.");
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const handleRespond = async (interestId, status) => {
    setRespondingId(interestId);
    try {
      await api.post("/admin/client-interests/respond", { interestId, status });
      toast.success(`Interest status updated to ${status}!`);
      // Update local state
      setInterests((prev) =>
        prev.map((item) => (item._id === interestId ? { ...item, status } : item))
      );
    } catch {
      toast.error("Failed to update interest status.");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      {/* Header */}
      <div className="mb-6 border-b border-rose-100 pb-5">
        <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
          <HeartHandshake className="text-maroon-600" /> Client Interests & Requests
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor and manage interest invitations sent to or received by your admin-created offline clients.
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : interests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white py-20 text-center">
          <HeartHandshake size={48} className="text-maroon-200 mb-4" />
          <p className="font-black text-slate-900">No client interests found</p>
          <p className="mt-2 text-sm text-slate-400">Offline clients haven't sent or received any interests yet.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {interests.map((item) => {
            const isClientSender = item.isClientSender;
            const client = isClientSender ? item.from : item.to;
            const clientProfile = isClientSender ? item.fromProfile : item.toProfile;
            
            const sender = isClientSender ? item.to : item.from;
            const senderProfile = isClientSender ? item.toProfile : item.fromProfile;

            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-soft p-5 md:p-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto]"
              >
                {/* 1. Offline Client Details */}
                <div className="bg-rose-50/20 rounded-xl p-4 border border-rose-50/50">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-maroon-100 font-black text-maroon-700 text-sm">
                      {(client?.fullName || "?").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-maroon-700 uppercase bg-maroon-50 px-2 py-0.5 rounded-md">
                        Your Client
                      </span>
                      {clientProfile?._id ? (
                        <Link to={`/profile/${clientProfile.profileId || clientProfile._id}`} className="font-bold text-slate-900 text-sm mt-1 hover:text-maroon-600 hover:underline flex items-center gap-1 w-fit">
                          {clientProfile.basic?.name || client?.fullName} <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{client?.fullName}</h4>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">
                        {clientProfile?.basic?.age ? `${clientProfile.basic.age} Yrs` : "—"} • {clientProfile?.location?.city || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="hidden lg:flex items-center justify-center text-rose-300">
                  {isClientSender ? (
                    <div className="flex flex-col items-center" title="Client Sent Invitation">
                      <ArrowUpRight size={22} className="animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Sent</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center" title="Client Received Invitation">
                      <ArrowDownLeft size={22} className="animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Received</span>
                    </div>
                  )}
                </div>

                {/* 2. Sender / Receiver Details */}
                <div className="bg-slate-50/40 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 font-black text-slate-700 text-sm">
                      {(sender?.fullName || "?").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                        {isClientSender ? "Receiver" : "Sender / Match"}
                      </span>
                      {senderProfile?._id ? (
                        <Link to={`/profile/${senderProfile.profileId || senderProfile._id}`} className="font-bold text-slate-900 text-sm mt-1 hover:text-slate-600 hover:underline flex items-center gap-1 w-fit">
                          {senderProfile.basic?.name || sender?.fullName} <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{sender?.fullName}</h4>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">
                        {senderProfile?.basic?.age ? `${senderProfile.basic.age} Yrs` : "—"} • {senderProfile?.location?.city || "—"} • {senderProfile?.career?.jobTitle || "—"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Sender Contact Details (always shown to Admin) */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                    <p className="flex items-center gap-1">
                      <Mail size={12} /> {sender?.email || "—"}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone size={12} /> {sender?.mobile || "—"}
                    </p>
                  </div>
                </div>

                {/* 3. Actions / Status Row */}
                <div className="flex flex-col justify-center gap-2 pt-2 lg:pt-0 min-w-[150px]">
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> Received: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  
                  {item.status === "Pending" ? (
                    isClientSender ? (
                      <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-center py-2 rounded-xl text-xs font-bold">
                        Pending Receiver Response
                      </span>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <button
                          disabled={respondingId === item._id}
                          onClick={() => handleRespond(item._id, "Accepted")}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          Accept
                        </button>
                        <button
                          disabled={respondingId === item._id}
                          onClick={() => handleRespond(item._id, "Rejected")}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          Decline
                        </button>
                      </div>
                    )
                  ) : item.status === "Accepted" ? (
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-center py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} /> Connected
                    </span>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-500 border border-slate-200 text-center py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                      <XCircle size={14} /> Rejected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
