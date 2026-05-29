"use client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { User } from "@/types/user";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(data?.detail || "Neuspješno učitavanje korisnika.");
        }

        if (!data?.is_admin) {
          window.location.replace("/profile");
          return;
        }

        setUser(data);
      } catch {
        window.location.replace("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Učitavanje admin panela...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <AdminPanel currentUser={user} />
      </main>
      <Footer />
    </div>
  );
}