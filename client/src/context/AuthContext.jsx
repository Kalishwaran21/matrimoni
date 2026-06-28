import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("soulmate_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("soulmate_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("soulmate_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("soulmate_token");
        localStorage.removeItem("soulmate_user");
        setToken(null);
        setUser(null);
      });
  }, [token]);

  // Listen for global logout event fired by the axios 401 interceptor
  useEffect(() => {
    const handle = () => { setToken(null); setUser(null); };
    window.addEventListener("soulmate:logout", handle);
    return () => window.removeEventListener("soulmate:logout", handle);
  }, []);

  const persist = (data) => {
    localStorage.setItem("soulmate_token", data.token);
    localStorage.setItem("soulmate_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", payload);
      persist(data);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      persist(data);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("soulmate_token");
    localStorage.removeItem("soulmate_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (fields) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...fields };
      localStorage.setItem("soulmate_user", JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(() => ({ token, user, loading, login, register, logout, updateUser }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
