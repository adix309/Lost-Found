"use client";

import Chip from "@mui/material/Chip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

interface AiMatchBadgeProps {
  label?: string;
  className?: string;
}

export function AiMatchBadge({ label = "AI checked", className = "" }: AiMatchBadgeProps) {
  return (
    <Chip
      icon={<FontAwesomeIcon icon={faRobot} />}
      label={label}
      color="primary"
      variant="outlined"
      size="small"
      className={className}
      aria-label="AI provjereno podudaranje"
      sx={{
        fontWeight: 700,
        backgroundColor: "primary.light",
        borderColor: "rgba(13, 148, 136, 0.2)",
        color: "primary.dark",
        "& .MuiChip-icon": {
          fontSize: "0.85rem",
          marginLeft: "6px",
          color: "inherit",
        }
      }}
    />
  );
}
