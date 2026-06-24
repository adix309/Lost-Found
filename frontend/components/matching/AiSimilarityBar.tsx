"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

interface AiSimilarityBarProps {
  score: number;
}

export function AiSimilarityBar({ score }: AiSimilarityBarProps) {
  const percent = score <= 1 ? Math.round(score * 100) : Math.round(score);
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // Determine color theme based on score
  let color: "warning" | "info" | "primary" | "success" = "warning";
  if (clampedPercent >= 80) {
    color = "success";
  } else if (clampedPercent >= 60) {
    color = "primary";
  } else if (clampedPercent >= 40) {
    color = "info";
  }

  return (
    <Box sx={{ width: "100%", my: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={clampedPercent}
        color={color}
        aria-label={`Vizuelna sličnost: ${clampedPercent}%`}
        sx={{
          height: 8,
          borderRadius: 9999,
          backgroundColor: "grey.200",
        }}
      />
    </Box>
  );
}
