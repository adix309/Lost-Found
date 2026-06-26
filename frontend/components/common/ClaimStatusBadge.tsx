import type { ClaimStatus } from "@/types/claim";
import Chip from "@mui/material/Chip";

const statusLabels: Record<ClaimStatus, string> = {
  pending: "Na čekanju",
  under_verification: "U provjeri",
  approved: "Odobren",
  accepted: "Odobren",
  handoff_pending: "Primopredaja u toku",
  completed: "Završen",
  rejected: "Odbijen",
  cancelled: "Otkazan",
};

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  let color: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "default" = "default";

  switch (status) {
    case "pending":
      color = "warning";
      break;
    case "under_verification":
      color = "info";
      break;
    case "approved":
    case "accepted":
      color = "primary";
      break;
    case "handoff_pending":
      color = "secondary";
      break;
    case "completed":
      color = "success";
      break;
    case "rejected":
      color = "error";
      break;
    case "cancelled":
    default:
      color = "default";
      break;
  }

  return (
    <Chip
      label={statusLabels[status] || status}
      color={color}
      size="small"
      sx={{
        fontWeight: 700,
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.02em",
        borderRadius: 1.5,
      }}
    />
  );
}
