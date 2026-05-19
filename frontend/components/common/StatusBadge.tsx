import type { ListingStatus } from "@/types/listing";

const statusLabels: Record<ListingStatus, string> = {
  active: "Izgubljeno",
  resolved: "Pronađeno",
  expired: "Završeno",
};

export function StatusBadge(props : { status: ListingStatus }) {
  return (
    <span className={`status-badge status-badge--${props.status}`}>
      {statusLabels[props.status]}
    </span>
  );
}
