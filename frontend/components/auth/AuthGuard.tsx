"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.replace("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        setIsAllowed(true);
      } catch (error) {
        localStorage.removeItem("access_token");
        window.location.replace("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}