"use client";

import type { ListingStatus } from "@/types/listing";
import Chip from "@mui/material/Chip";
import { useI18n } from "@/components/i18n/I18nProvider";

export function StatusBadge({ status }: { status: ListingStatus }) {
  const { t } = useI18n();
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
      label={t(`statuses.${status}`)}
      color={color}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}
