"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminGuard } from "@/components/auth/AdminGuard";
import Box from "@mui/material/Box";

export default function AdminPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
        <AdminGuard>
          <AdminPanel />
        </AdminGuard>
      </Box>
      <Footer />
    </Box>
  );
}