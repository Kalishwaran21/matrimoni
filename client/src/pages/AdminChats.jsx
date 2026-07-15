import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { formatName } from "../utils/transliterate";
import { useLanguage } from "../context/LanguageContext";

export default function AdminChats() {
  const { language } = useLanguage();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/chats");
      setChats(data);
    } catch (error) {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chat) => {
    try {
      const { data } = await api.get(`/admin/chats/${chat._id}`);
      setActiveChat(data);
    } catch (error) {
      toast.error("Failed to load chat messages");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-maroon-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm md:grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <aside className="flex flex-col border-r border-rose-100 bg-white">
        <div className="border-b border-rose-100 px-5 py-4">
          <h2 className="text-lg font-black text-maroon-800">All Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>No active conversations found</p>
            </div>
          ) : (
            chats.map((chat) => {
              const p1 = chat.participants[0];
              const p2 = chat.participants[1];
              const isActive = activeChat?._id === chat._id;
              
              return (
                <button
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors border-b border-rose-50 ${
                    isActive ? "bg-maroon-50" : "hover:bg-slate-50"
                  }`}
                >
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-maroon-700" : "text-slate-900"}`}>
                    {formatName(p1, language)} &amp; {formatName(p2, language)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {chat.messages.length} messages
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex flex-col bg-slate-50/50">
        {activeChat ? (
          <>
            <div className="border-b border-rose-100 px-5 py-4 bg-white">
              <p className="font-black text-slate-950">
                {formatName(activeChat.participants[0], language)} and {formatName(activeChat.participants[1], language)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Started {new Date(activeChat.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {activeChat.messages.map((msg) => {
                const isP1 = msg.sender._id === activeChat.participants[0]._id;
                return (
                  <div key={msg._id} className={`flex flex-col ${isP1 ? "items-start" : "items-end"}`}>
                    <span className="mb-1 text-[10px] font-bold text-slate-400">
                      {formatName(msg.sender, language)}
                    </span>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isP1 
                        ? "bg-white border border-rose-100 text-slate-800 rounded-tl-sm"
                        : "bg-maroon-600 text-white rounded-tr-sm shadow-sm"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div className="max-w-xs px-6 py-8">
              <h3 className="mb-2 text-xl font-black text-slate-900">Select a chat</h3>
              <p className="text-sm text-slate-500">
                Click on a conversation in the sidebar to view the message history between users.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
