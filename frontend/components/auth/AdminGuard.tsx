"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type AdminGuardProps = {
  children: React.ReactNode;
};

async function parseJsonSafe(res: Response) {
  return res.json().catch(() => null);
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let ignore = false;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await parseJsonSafe(response);

        if (!response.ok) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        if (!data?.is_admin) {
          window.location.replace("/profile");
          return;
        }

        if (!ignore) {
          setCurrentUser(data);
          setIsAllowed(true);
        }
      } catch {
        localStorage.removeItem("access_token");
        window.location.replace("/login");
      } finally {
        if (!ignore) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      ignore = true;
    };
  }, []);

  if (isChecking) return null;
  if (!isAllowed) return null;

  return <>{children}</>;
}