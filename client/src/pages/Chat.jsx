import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";

function Avatar({ name, online }) {
  return (
    <div className="relative shrink-0">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-maroon-100 font-black text-maroon-700 text-sm">
        {(name || "?").charAt(0).toUpperCase()}
      </span>
      <span
        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
          online ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { socket, presence } = useSocket();
  const { t, language } = useLanguage();
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/chat").then(({ data }) => {
      setChats(data.chats || []);
      setLoading(false);
    });
  }, []);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("message:new", ({ chatId, message }) => {
      setChats((cur) =>
        cur.map((c) => (c._id === chatId ? { ...c, messages: [...c.messages, message] } : c))
      );
      setActive((cur) => {
        if (cur?._id === chatId) return { ...cur, messages: [...cur.messages, message] };
        return cur;
      });
    });
    socket.on("typing", ({ from, isTyping }) => {
      if (active?.participants?.some((p) => String(p._id) === String(from))) {
        setTyping(isTyping);
      }
    });
    return () => { socket.off("message:new"); socket.off("typing"); };
  }, [socket, active]);

  const select = async (chat) => {
    const other = chat.participants.find((p) => p._id !== user.id);
    const { data } = await api.get(`/chat/${other._id}`);
    setActive(data.chat);
  };

  const send = () => {
    if (!text.trim() || !active) return;
    const other = active.participants.find((p) => p._id !== user.id);
    setSending(true);
    socket.emit("message:send", { to: other._id, text }, (ack) => {
      setSending(false);
      if (ack?.ok) setText("");
      else if (ack?.message) alert(ack.message);
    });
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const activeOther = active?.participants?.find((p) => p._id !== user.id);
  const isOnline = presence[activeOther?._id];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-0 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-soft lg:grid-cols-[300px_1fr]" style={{ height: "calc(100vh - 10rem)" }}>
      {/* Sidebar */}
      <aside className="flex flex-col border-r border-rose-100">
        <div className="border-b border-rose-100 p-5">
          <h1 className="text-xl font-black text-slate-950">{t("messagesTitle")}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {language === "en"
              ? `${chats.length} conversation${chats.length !== 1 ? "s" : ""}`
              : `${chats.length} உரையாடல்கள்`}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle size={32} className="text-maroon-200 mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                {language === "en" ? "No conversations yet" : "உரையாடல்கள் இன்னும் தொடங்கவில்லை"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === "en" ? "Accept an interest to start chatting." : "பேசத் தொடங்க விருப்பக்கோரிக்கையை ஏற்கவும்."}
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const other = chat.participants.find((p) => p._id !== user.id);
              const online = presence[other?._id];
              const isActive = active?._id === chat._id;
              return (
                <button
                  key={chat._id}
                  onClick={() => select(chat)}
                  className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors border-b border-rose-50 ${
                    isActive ? "bg-maroon-50" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar name={other?.fullName} online={online} />
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${isActive ? "text-maroon-700" : "text-slate-900"}`}>
                      {other?.fullName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{online ? t("online") : t("offline")}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-col">
        {active ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-rose-100 px-5 py-4">
              <Avatar name={activeOther?.fullName} online={isOnline} />
              <div>
                <p className="font-black text-slate-950">{activeOther?.fullName}</p>
                <p className="text-xs text-slate-400">
                  {typing ? (
                    <span className="text-emerald-600 font-medium">{language === "en" ? "Typing..." : "தட்டச்சு செய்கிறார்..."}</span>
                  ) : isOnline ? (
                    <span className="text-emerald-600 font-medium">{t("online")}</span>
                  ) : (
                    t("offline")
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {active.messages.map((msg) => {
                const mine = msg.sender === user.id || msg.sender?._id === user.id;
                return (
                  <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        mine
                          ? "bg-gradient-to-br from-maroon-600 to-maroon-700 text-white rounded-br-sm"
                          : "bg-rose-50 text-slate-800 border border-rose-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-3 border-t border-rose-100 px-5 py-4">
              <input
                id="chat-input"
                className="field flex-1"
                placeholder={t("typeMessage")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                onFocus={() => activeOther && socket?.emit("typing", { to: activeOther._id, isTyping: true })}
                onBlur={() => activeOther && socket?.emit("typing", { to: activeOther._id, isTyping: false })}
              />
              <button
                id="chat-send"
                className="btn-primary !px-4 !py-3 shrink-0"
                onClick={send}
                disabled={sending || !text.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <MessageCircle size={48} className="text-maroon-200 mb-4" />
            <p className="text-lg font-black text-slate-900">{t("noChatSelect")}</p>
            <p className="mt-2 text-sm text-slate-400 max-w-xs">
              {language === "en"
                ? "Choose a conversation from the left panel to start messaging."
                : "அரட்டையடிக்க இடது பக்க பேனலில் இருந்து ஒரு நபரைத் தேர்ந்தெடுக்கவும்."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
