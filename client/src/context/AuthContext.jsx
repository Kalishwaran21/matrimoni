import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("soulmate_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("soulmate_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("soulmate_user");
        localStorage.removeItem("soulmate_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Listen for global logout event fired by the axios 401 interceptor
  useEffect(() => {
    const handle = () => { setUser(null); localStorage.removeItem("soulmate_user"); localStorage.removeItem("soulmate_token"); };
    window.addEventListener("soulmate:logout", handle);
    return () => window.removeEventListener("soulmate:logout", handle);
  }, []);

  const persist = (data) => {
    localStorage.setItem("soulmate_user", JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem("soulmate_token", data.token);
    }
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

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("soulmate_user");
      localStorage.removeItem("soulmate_token");
      setUser(null);
    }
  };

  const updateUser = (fields) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...fields };
      localStorage.setItem("soulmate_user", JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, updateUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
