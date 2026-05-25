import type { ListingStatus } from "@/types/listing";
import styles from "./StatusBadge.module.css";

const statusLabels: Record<ListingStatus, string> = {
  active: "Aktivan",
  resolved: "Riješen",
  expired: "Istekao",
};

export function StatusBadge(props : { status: ListingStatus }) {
  return (
    <span className={`${styles["status-badge"]} ${styles[`status-badge--${props.status}`]}`}>
      {statusLabels[props.status]}
    </span>
  );
}
