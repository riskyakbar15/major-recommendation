"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Admin, LoginResponse } from "@/types";

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    // The access token lives in an HttpOnly cookie sent automatically; we cannot
    // read it from JS, so we verify the session by calling the protected endpoint.
    try {
      const response = await adminApi.getCurrentAdmin();
      setAdmin(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setAdmin(null);
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

    // Tokens are set by the server as HttpOnly cookies; nothing to store here.
    setAdmin(data.admin);
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    try {
      // Server clears the HttpOnly auth cookies.
      await adminApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
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
