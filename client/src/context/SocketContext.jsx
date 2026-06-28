import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [presence, setPresence] = useState({});

  useEffect(() => {
    if (!token) {
      setSocket((prev) => { prev?.disconnect(); return null; });
      return;
    }

    const nextSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      // Prefer websocket transport — avoids the HTTP long-poll CORS errors
      transports: ["websocket"],
      // Limit retries so it doesn't spam the console endlessly
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });

    nextSocket.on("presence:update", ({ userId, online }) => {
      setPresence((current) => ({ ...current, [userId]: online }));
    });

    nextSocket.on("connect_error", (err) => {
      // Silently handle connection errors — server may just not be running
      console.warn("Socket connection failed:", err.message);
    });

    setSocket(nextSocket);
    return () => nextSocket.disconnect();
  }, [token]);

  const value = useMemo(() => ({ socket, presence }), [socket, presence]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);

