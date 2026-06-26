"use client";

import Link from "next/link";
import Image from "next/image";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faCalendarDay, faCoins, faStar } from "@fortawesome/free-solid-svg-icons";

import type { Listing } from "@/types/listing";
import { StatusBadge } from "@/components/common/StatusBadge";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const date = `${day}/${month}/${year}`;

  const time = parsed.toLocaleTimeString("bs-BA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} · ${time}`;
}

export function ListingCard({ listing, isFeatured = false }: { listing: Listing; isFeatured?: boolean }) {
  const imageSrc = listing.image_url ? `${API_URL}${listing.image_url}` : "/no-image.jpg";
  const imageAlt = listing.image_url ? listing.title : "Slika nije dodana";
  const eventDate = formatDateTime(listing.event_date);
  const isLost = listing.item_type === "lost";

  return (
    <Card
      component={Link}
      href={`/AllItems/${listing.id}`}
      sx={{
        display: "flex",
        flexDirection: isFeatured ? { xs: "column", md: "row" } : "column",
        textDecoration: "none",
        color: "inherit",
        height: "100%",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 36px rgba(28, 25, 23, 0.06)",
          borderColor: "primary.main",
        },
        gridColumn: isFeatured ? "1 / -1" : "auto",
        border: "1px solid",
        borderColor: isFeatured ? "rgba(27, 77, 62, 0.2)" : "grey.200",
        background: isFeatured
          ? "linear-gradient(to right, #ffffff, var(--primary-light))"
          : "background.paper",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: isFeatured ? { xs: "100%", md: "42%" } : "100%",
          height: isFeatured ? { xs: 180, md: "auto" } : 170,
          minHeight: isFeatured ? { md: 220 } : "auto",
          backgroundColor: "grey.50",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          style={{ objectFit: "cover" }}
          unoptimized
        />

        <Chip
          label={isLost ? "Izgubljeno" : "Pronađeno"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: 800,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#ffffff",
            backgroundColor: isLost ? "error.main" : "success.main",
            boxShadow: isLost
              ? "0 4px 8px rgba(122, 31, 43, 0.2)"
              : "0 4px 8px rgba(27, 77, 62, 0.2)",
            zIndex: 2,
          }}
        />

        {isFeatured && (
          <Chip
            icon={<FontAwesomeIcon icon={faStar} />}
            label="Istaknuti oglas"
            size="small"
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              fontWeight: 800,
              fontSize: "0.7rem",
              color: "#ffffff",
              backgroundColor: "secondary.dark",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              zIndex: 2,
              "& .MuiChip-icon": { color: "inherit", fontSize: "0.8rem" },
            }}
          />
        )}

        {listing.reward_amount !== null && listing.reward_amount !== undefined && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "0.35rem 0.75rem",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              color: "primary.main",
              border: "1px solid",
              borderColor: "rgba(27, 77, 62, 0.15)",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 700,
              zIndex: 2,
              boxShadow: "0 4px 10px rgba(28, 25, 23, 0.04)",
              backdropFilter: "blur(4px)",
            }}
          >
            <FontAwesomeIcon icon={faCoins} style={{ marginRight: "4px" }} /> Nagrada: {listing.reward_amount} KM
          </Box>
        )}
      </Box>

      <CardContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: 1,
          justifyContent: isFeatured ? "center" : "flex-start",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: isFeatured ? "1.25rem" : "1.05rem",
              lineHeight: 1.3,
              color: "text.primary",
            }}
          >
            {listing.title}
          </Typography>
          <StatusBadge status={listing.status} />
        </Stack>

        <Stack spacing={0.6} sx={{ mt: 0.2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <FontAwesomeIcon icon={faMapPin} style={{ color: "var(--slate-400)", width: 12, flexShrink: 0, fontSize: "0.8rem" }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {listing.location_name || "Lokacija nije navedena"}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <FontAwesomeIcon icon={faCalendarDay} style={{ color: "var(--slate-400)", width: 12, flexShrink: 0, fontSize: "0.8rem" }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              {eventDate}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          variant="subtitle2"
          color="primary.main"
          sx={{
            fontWeight: 700,
            fontSize: "0.8rem",
            mt: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            pt: 0.5,
          }}
        >
          Pogledaj detalje &rarr;
        </Typography>
      </CardContent>
    </Card>
  );
}
