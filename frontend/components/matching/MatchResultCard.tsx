"use client";

import Link from "next/link";
import Image from "next/image";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faCalendarDay, faArrowUp, faStar } from "@fortawesome/free-solid-svg-icons";
import type { NotificationMatchPreview } from "@/types/notification";
import { AiMatchBadge } from "./AiMatchBadge";
import { AiSimilarityBar } from "./AiSimilarityBar";
import { AiSimilarityLabel } from "./AiSimilarityLabel";
import { AiMatchExplanationTooltip } from "./AiMatchExplanationTooltip";

interface MatchResultCardProps {
  match: NotificationMatchPreview;
  isBestMatch?: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function formatEventDate(value?: string | null) {
  if (!value) return "Nepoznat datum";

  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    const datePart = `${day}/${month}/${year}`;
    
    const timePart = parsed.toLocaleTimeString("bs-BA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    return `${datePart} · ${timePart}`;
  } catch {
    return value;
  }
}

export function MatchResultCard({ match, isBestMatch = false }: MatchResultCardProps) {
  // Defensively support both snake_case (from DB/backend) and camelCase properties
  const usedAi = match.usedAiImageMatching === true || match.used_image_reranking === true;
  
  const similarityScore = match.imageSimilarityScore !== undefined && match.imageSimilarityScore !== null
    ? match.imageSimilarityScore
    : (match.image_similarity_score !== undefined && match.image_similarity_score !== null ? match.image_similarity_score : null);

  const descriptionScore = match.descriptionScore !== undefined && match.descriptionScore !== null
    ? match.descriptionScore
    : (match.description_score !== undefined && match.description_score !== null ? match.description_score : null);

  const finalScore = match.finalScore !== undefined && match.finalScore !== null
    ? match.finalScore
    : (match.final_score !== undefined && match.final_score !== null ? match.final_score : null);

  const rankImproved = match.rank_improved === true || match.rankImproved === true;

  // Build the link to detail page with AI matching metrics in search params
  const queryParams = new URLSearchParams({
    ai_checked: String(usedAi),
    similarity: similarityScore !== null ? String(similarityScore) : "",
    description_score: descriptionScore !== null ? String(descriptionScore) : "",
    rank: match.rank !== undefined && match.rank !== null ? String(match.rank) : "",
    rank_improved: String(rankImproved),
  });

  const detailUrl = `/AllItems/${match.item_id}?${queryParams.toString()}`;

  // Image source logic
  const imageSrc = match.image_url
    ? (match.image_url.startsWith("http") ? match.image_url : `${API_URL}${match.image_url}`)
    : "/no-image.jpg";

  const percentScore = Math.round(match.score * 100);

  return (
    <Card sx={{ mb: 2, display: "flex", flexDirection: "column" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ p: 2.5 }}>
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", sm: 110 },
            height: { xs: 140, sm: 110 },
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "grey.100",
            flexShrink: 0,
          }}
        >
          <Image
            src={imageSrc}
            alt={match.title}
            fill
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
            <Box>
              <Typography variant="h6" component="h4" sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary", lineHeight: 1.3 }}>
                {match.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                {match.category || "Nepoznata kategorija"}
              </Typography>
            </Box>
            <Chip
              label={`Ukupno: ${percentScore}%`}
              size="small"
              sx={{ fontWeight: 700, backgroundColor: "grey.100", color: "text.primary" }}
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ my: 1, flexWrap: "wrap", gap: 1 }} useFlexGap>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <FontAwesomeIcon icon={faMapPin} style={{ color: "var(--slate-500)", fontSize: "0.85rem" }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                <strong>Lokacija:</strong> {match.location_name || "Nepoznata lokacija"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <FontAwesomeIcon icon={faCalendarDay} style={{ color: "var(--slate-500)", fontSize: "0.85rem" }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                <strong>Datum:</strong> {formatEventDate(match.event_date)}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }} useFlexGap>
            {usedAi && <AiMatchBadge />}
            
            {usedAi && isBestMatch && (
              <Chip
                icon={<FontAwesomeIcon icon={faStar} />}
                label="Najbliži vizuelni match"
                size="small"
                sx={{
                  fontWeight: 700,
                  backgroundColor: "#fef3c7",
                  color: "#b45309",
                  borderColor: "#fde68a",
                  "& .MuiChip-icon": { color: "inherit", fontSize: "0.8rem", marginLeft: "4px" },
                }}
              />
            )}

            {usedAi && rankImproved && (
              <Chip
                icon={<FontAwesomeIcon icon={faArrowUp} />}
                label="Pomjeren više nakon AI provjere slika"
                size="small"
                color="info"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  backgroundColor: "#f0f9ff",
                  borderColor: "#bae6fd",
                  color: "#0369a1",
                  "& .MuiChip-icon": { color: "inherit", fontSize: "0.8rem", marginLeft: "4px" },
                }}
              />
            )}
          </Stack>
        </Box>
      </Stack>

      <Divider />

      <Box sx={{ p: 2.5, backgroundColor: "background.default" }}>
        {usedAi ? (
          similarityScore !== null ? (
            <Stack spacing={1}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.85rem" }}>
                    Vizuelna sličnost
                  </Typography>
                  <AiMatchExplanationTooltip />
                </Stack>
                <AiSimilarityLabel score={similarityScore} />
              </Stack>
              <AiSimilarityBar score={similarityScore} />
              <Typography variant="caption" color="text.secondary">
                Sličnost slika: {Math.round(similarityScore <= 1 ? similarityScore * 100 : similarityScore)}%
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", fontSize: "0.8rem" }}>
              Nema dovoljno slika za vizuelno poređenje.
            </Typography>
          )
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", fontSize: "0.8rem" }}>
            Prikazano na osnovu opisa i ostalih podataka.
          </Typography>
        )}

        {Array.isArray(match.reasons) && match.reasons.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.825rem", color: "#57534e" }}>
              {match.reasons.slice(0, 3).map((reason, index) => (
                <li key={`${match.match_id}-${index}`} style={{ marginBottom: "0.2rem" }}>
                  {reason}
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Box>

      <CardActions sx={{ justifyContent: "flex-end", p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          component={Link}
          href={detailUrl}
          variant="contained"
          color="secondary"
          size="small"
          sx={{
            backgroundColor: "text.primary",
            color: "background.paper",
            "&:hover": {
              backgroundColor: "primary.main",
            },
          }}
        >
          Otvori detalje
        </Button>
      </CardActions>
    </Card>
  );
}
