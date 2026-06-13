import { NotificationsPage } from "@/components/notifications/NotificationsPage";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Page() {
  return (
    <AuthGuard>
      <NotificationsPage />
    </AuthGuard>
  );
}