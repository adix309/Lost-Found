import type { ListingStatus } from "@/types/listing";

const statusLabels: Record<ListingStatus, string> = {
  lost: "Izgubljeno",
  found: "Pronađeno",
  resolved: "Završeno",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {statusLabels[status]}
    </span>
  );
}
