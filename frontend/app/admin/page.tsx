"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminPage() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <AdminGuard>
          <AdminPanel />
        </AdminGuard>
      </main>
      <Footer />
    </div>
  );
}