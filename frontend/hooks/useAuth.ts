"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { adminApi } from "@/lib/api";
import { Admin, LoginResponse } from "@/types";

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await adminApi.getCurrentAdmin();
      setAdmin(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await adminApi.login(username, password);
    const data: LoginResponse = response.data;

    Cookies.set("access_token", data.access_token, {
      expires: 1,
      path: "/",
      sameSite: "lax",
    });
    Cookies.set("refresh_token", data.refresh_token, {
      expires: 7,
      path: "/",
      sameSite: "lax",
    });

    setAdmin(data.admin);
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    try {
      await adminApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  return {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}
