"use client";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface AiMatchExplanationTooltipProps {
  text?: string;
}

export function AiMatchExplanationTooltip({
  text = "Ova vrijednost pokazuje koliko slike djeluju vizuelno slično. Ne potvrđuje vlasništvo i služi samo kao dodatni signal uz opis predmeta.",
}: AiMatchExplanationTooltipProps) {
  return (
    <Tooltip title={text} arrow enterDelay={100} leaveDelay={200}>
      <IconButton
        size="small"
        aria-label="Informacije o vizuelnoj sličnosti"
        sx={{
          color: "text.secondary",
          "&:hover": {
            color: "primary.main",
          },
        }}
      >
        <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: "0.9rem" }} />
      </IconButton>
    </Tooltip>
  );
}
