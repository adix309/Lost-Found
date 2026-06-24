import type { ListingStatus } from "@/types/listing";
import Chip from "@mui/material/Chip";

const statusLabels: Record<ListingStatus, string> = {
  active: "Aktivan",
  resolved: "Riješen",
  expired: "Istekao",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  let color: "primary" | "success" | "default" | "error" = "default";
  
  if (status === "active") {
    color = "primary";
  } else if (status === "resolved") {
    color = "success";
  } else if (status === "expired") {
    color = "default";
  }

  return (
    <Chip 
      label={statusLabels[status]} 
      color={color}
      size="small" 
      sx={{ fontWeight: 700 }}
    />
  );
}
