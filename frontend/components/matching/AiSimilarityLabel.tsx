"use client";

import Box from "@mui/material/Box";

interface AiSimilarityLabelProps {
  score: number;
}

export function AiSimilarityLabel({ score }: AiSimilarityLabelProps) {
  const value = score <= 1 ? score : score / 100;

  let text = "Niža sličnost";
  let color = "warning.main";

  if (value >= 0.80) {
    text = "Vrlo visoka sličnost";
    color = "success.dark";
  } else if (value >= 0.60) {
    text = "Visoka sličnost";
    color = "primary.dark";
  } else if (value >= 0.40) {
    text = "Srednja sličnost";
    color = "info.main";
  }

  return (
    <Box
      component="span"
      sx={{
        fontSize: "0.8rem",
        fontWeight: 700,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        color: color,
        display: "inline-block",
      }}
    >
      {text}
    </Box>
  );
}
