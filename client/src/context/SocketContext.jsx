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
      setSocket(null);
      return;
    }

    const nextSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token }
    });

    nextSocket.on("presence:update", ({ userId, online }) => {
      setPresence((current) => ({ ...current, [userId]: online }));
    });

    setSocket(nextSocket);
    return () => nextSocket.disconnect();
  }, [token]);

  const value = useMemo(() => ({ socket, presence }), [socket, presence]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
