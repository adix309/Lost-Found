"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import type { NotificationMatchPreview } from "@/types/notification";
import { MatchResultCard } from "./MatchResultCard";

interface MatchResultsListProps {
  matches: NotificationMatchPreview[];
}

export function MatchResultsList({ matches }: MatchResultsListProps) {
  if (!matches || matches.length === 0) {
    return (
      <Box sx={{ p: 2, color: "text.secondary", fontStyle: "italic", textAlign: "center" }}>
        Nema pronađenih poklapanja.
      </Box>
    );
  }

  // 1. Check if AI image matching was applied to any of the results
  const isAiApplied = matches.some((m) => m.usedAiImageMatching || m.used_image_reranking);

  // 2. Identify the best visual match
  let bestVisualMatchId: number | null = null;
  let maxScore = -1;

  matches.forEach((m) => {
    const usedAi = m.usedAiImageMatching === true || m.used_image_reranking === true;
    const similarityScore = m.imageSimilarityScore !== undefined && m.imageSimilarityScore !== null
      ? m.imageSimilarityScore
      : (m.image_similarity_score !== undefined && m.image_similarity_score !== null ? m.image_similarity_score : null);

    if (usedAi && similarityScore !== null) {
      if (similarityScore > maxScore) {
        maxScore = similarityScore;
        bestVisualMatchId = m.match_id;
      }
    }
  });

  return (
    <Box>
      {isAiApplied && (
        <Alert
          severity="success"
          icon={<FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: "1.1rem" }} />}
          sx={{
            mb: 3,
            borderRadius: 3,
            backgroundColor: "primary.light",
            border: "1px solid",
            borderColor: "rgba(13, 148, 136, 0.15)",
            color: "primary.dark",
            "& .MuiAlert-message": {
              fontWeight: 600,
              fontSize: "0.9rem",
            },
          }}
        >
          Dodatna AI provjera slika je primijenjena nad ovim rezultatima za preciznije rangiranje.
        </Alert>
      )}

      <Box>
        {matches.map((match) => (
          <MatchResultCard
            key={match.match_id}
            match={match}
            isBestMatch={match.match_id === bestVisualMatchId}
          />
        ))}
      </Box>
    </Box>
  );
}
