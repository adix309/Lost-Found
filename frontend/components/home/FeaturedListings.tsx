"use client";

import { useMemo, useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faLocationDot, faMagnifyingGlass, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import type { Listing, ListingType } from "@/types/listing";
import { ListingCard } from "@/components/listings/ListingCard";
import { SectionHeading } from "@/components/common/SectionHeading";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const tabs: { label: string; value: ListingType }[] = [
  { label: "Najnovije izgubljeno", value: "lost" },
  { label: "Najnovije pronađeno", value: "found" },
];

export function FeaturedListings() {
  const [activeTab, setActiveTab] = useState<ListingType>("lost");
  const [items, setItems] = useState([] as Listing[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null as string | null);

  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationSource, setLocationSource] = useState<"user" | "fallback" | null>(null);

  // Request user's location on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationSource("user");
        },
        (err) => {
          console.warn("Geolocation permission denied or failed, using Sarajevo as default:", err);
          setUserCoords({ latitude: 43.8563, longitude: 18.4131 });
          setLocationSource("fallback");
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      window.setTimeout(() => {
        setUserCoords({ latitude: 43.8563, longitude: 18.4131 });
        setLocationSource("fallback");
      }, 0);
    }
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/items`);

        if (!response.ok) {
          throw new Error("Greška pri dohvaćanju itema iz baze");
        }

        const data: Listing[] = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        setError("Nije moguće učitati najnovije oglase. Provjerite da li backend radi.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 200);
    return () => clearTimeout(timer);
  }, []);

  const listings = useMemo(() => {
    if (!userCoords) {
      // While loading location, return newest 3 as placeholder
      return items
        .filter((listing) => listing.item_type === activeTab)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 3);
    }

    const isFallback = locationSource === "fallback";

    // Helper to calculate score based on proximity or name string matching
    const getListingDistanceScore = (listing: Listing) => {
      if (listing.latitude !== null && listing.longitude !== null) {
        const dLat = listing.latitude - userCoords.latitude;
        const dLon = listing.longitude - userCoords.longitude;
        return Math.sqrt(dLat * dLat + dLon * dLon);
      }
      
      // Fallback: If listing has no coords, check string match for Sarajevo
      if (isFallback) {
        const name = listing.location_name?.toLowerCase() || "";
        if (name.includes("sarajevo")) {
          return 0.15; // roughly ~15km
        }
      }
      return 999;
    };

    return items
      .filter((listing) => listing.item_type === activeTab)
      .map((listing) => ({
        listing,
        distance: getListingDistanceScore(listing),
      }))
      .sort((a, b) => {
        // If distance is very close, sort by date created
        if (Math.abs(a.distance - b.distance) < 0.0001) {
          return Date.parse(b.listing.created_at) - Date.parse(a.listing.created_at);
        }
        return a.distance - b.distance;
      })
      .map((item) => item.listing)
      .slice(0, 3);
  }, [activeTab, items, userCoords, locationSource]);

  let content = null;

  if (isLoading) {
    content = (
      <Grid container spacing={4}>
        {[1, 2, 3].map((n) => (
          <Grid key={n} size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: 380, display: "flex", flexDirection: "column", borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent sx={{ flexGrow: 1, p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  } else if (error) {
    content = (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  } else if (listings.length === 0) {
    content = (
      <Card
        sx={{
          p: 6,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          maxWidth: "36rem",
          mx: "auto",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Trenutno nema oglasa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Zajednica je za sada sigurna i nema prijavljenih predmeta u ovoj sekciji.
        </Typography>
      </Card>
    );
  } else {
    content = (
      <Grid container spacing={3}>
        {listings.map((listing, index) => (
          <Grid key={listing.id} size={{ xs: 12, md: index === 0 ? 12 : 4 }}>
            <ListingCard listing={listing} isFeatured={index === 0} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        component="section"
        sx={{
          order: 2,
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "grey.200",
          py: { xs: 7, md: 9 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "flex-end" },
              mb: 7,
              gap: 3,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <SectionHeading
                title="Najnovije prijave"
                description="Najnovije prijave predmeta iz vaše lokalne zajednice"
              />
              {locationSource && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.8,
                    bgcolor: locationSource === "user" ? "primary.light" : "grey.100",
                    color: locationSource === "user" ? "primary.main" : "text.secondary",
                    px: 1.8,
                    py: 0.6,
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    mt: -2.5,
                    mb: 2,
                    border: "1px solid",
                    borderColor: locationSource === "user" ? "rgba(27, 77, 62, 0.15)" : "grey.200",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <FontAwesomeIcon icon={faLocationDot} size="sm" style={{ color: locationSource === "user" ? "#1b4d3e" : "#57534e" }} />
                  {locationSource === "user" ? "Blizu vas" : "Lokacija: Sarajevo (default)"}
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                bgcolor: "background.paper",
                p: 0.7,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "grey.200",
                width: "fit-content",
                boxShadow: "0 1px 3px rgba(28, 25, 23, 0.02)",
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                const isLost = tab.value === "lost";
                return (
                  <Button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    sx={{
                      borderRadius: 2,
                      px: 2.5,
                      py: 1,
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      textTransform: "none",
                      color: isActive ? "white" : "text.secondary",
                      bgcolor: isActive
                        ? isLost
                          ? "error.main"
                          : "primary.main"
                        : "transparent",
                      boxShadow: isActive
                        ? isLost
                          ? "0 4px 10px rgba(122, 31, 43, 0.2)"
                          : "0 4px 10px rgba(27, 77, 62, 0.2)"
                        : "none",
                      "&:hover": {
                        bgcolor: isActive
                          ? isLost
                            ? "error.dark"
                            : "primary.dark"
                          : "grey.100",
                      },
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Box>
          </Stack>

          {content}
        </Container>
      </Box>

      {/* Map Preview Section - High Rhythm Break */}
      <Box
        component="section"
        sx={{
          order: 1,
          bgcolor: "primary.light",
          borderBottom: "1px solid",
          borderColor: "grey.200",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 7, md: 10 },
            px: { xs: 2, md: 3 },
          }}
        >
          <Grid container spacing={7} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 6.5 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  bgcolor: "rgba(27, 77, 62, 0.08)", // translucent primary
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: "rgba(27, 77, 62, 0.15)",
                  borderRadius: 999,
                  px: 2,
                  py: 0.9,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  mb: 2.5,
                }}
              >
                <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: "6px" }} /> Geografska pretraga
              </Box>

              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 2.5,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Pronađite izgubljene predmete na mapi
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                }}
              >
                Ponekad je vizuelni kontekst presudan za pronalazak. Naša interaktivna mapa vam omogućava da vidite tačna mjesta prijava predmeta, filtrirate ih po kategorijama i lakše locirate stvari u vašoj blizini.
              </Typography>

              <Button
                component={Link}
                href="/map"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<FontAwesomeIcon icon={faMap} />}
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.8,
                  borderRadius: 3,
                  textTransform: "none",
                }}
              >
                Otvori interaktivnu mapu
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 5.5 }} sx={{ display: "flex", justifyContent: "center" }}>
              {/* Map Mockup */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 460,
                  height: 340,
                  borderRadius: 3,
                  background: "radial-gradient(circle at 30% 30%, #e0f2fe 0%, #f0fdf4 100%)",
                  border: "4px solid",
                  borderColor: "common.white",
                  boxShadow: "0 20px 45px rgba(28, 25, 23, 0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Mockup Grid */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundSize: "30px 30px",
                    backgroundImage: `
                      linear-gradient(to right, rgba(27, 77, 62, 0.04) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(27, 77, 62, 0.04) 1px, transparent 1px)
                    `,
                  }}
                />

                {/* Marker 1 - Lost */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "30%",
                    left: "45%",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    boxShadow: "0 0 0 4px rgba(122, 31, 43, 0.15)",
                    zIndex: 10,
                    "&:hover .marker-card": {
                      opacity: 0.95,
                      transform: "translateX(-50%) translateY(-4px)",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      top: -8,
                      left: -8,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "rgba(122, 31, 43, 0.25)",
                      animation: "markerPulse 2s infinite ease-out",
                      pointerEvents: "none",
                      "@keyframes markerPulse": {
                        "0%": { transform: "scale(0.5)", opacity: 1 },
                        "100%": { transform: "scale(1.6)", opacity: 0 },
                      },
                    }}
                  />
                  <Box
                    className="marker-card"
                    sx={{
                      position: "absolute",
                      bottom: 26,
                      left: "50%",
                      transform: "translateX(-50%) translateY(0)",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "grey.200",
                      borderRadius: 1.5,
                      p: 1.2,
                      boxShadow: "0 8px 24px rgba(28, 25, 23, 0.1)",
                      width: 160,
                      pointerEvents: "none",
                      opacity: 0,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      zIndex: 15,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontSize: "0.75rem", fontWeight: 800, color: "text.primary", lineHeight: 1.2, mb: 0.2 }}>
                      <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: "4px" }} /> Izgubljen Novčanik
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "text.secondary", fontWeight: 600 }}>
                      BBI Centar, Sarajevo
                    </Typography>
                  </Box>
                </Box>

                {/* Marker 2 - Found */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "62%",
                    left: "68%",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    boxShadow: "0 0 0 4px rgba(27, 77, 62, 0.15)",
                    zIndex: 10,
                    "&:hover .marker-card": {
                      opacity: 0.95,
                      transform: "translateX(-50%) translateY(-4px)",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      top: -8,
                      left: -8,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "rgba(27, 77, 62, 0.25)",
                      animation: "markerPulse 2s infinite ease-out",
                      pointerEvents: "none",
                    }}
                  />
                  <Box
                    className="marker-card"
                    sx={{
                      position: "absolute",
                      bottom: 26,
                      left: "50%",
                      transform: "translateX(-50%) translateY(0)",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "grey.200",
                      borderRadius: 1.5,
                      p: 1.2,
                      boxShadow: "0 8px 24px rgba(28, 25, 23, 0.1)",
                      width: 160,
                      pointerEvents: "none",
                      opacity: 0,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      zIndex: 15,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontSize: "0.75rem", fontWeight: 800, color: "text.primary", lineHeight: 1.2, mb: 0.2 }}>
                      <FontAwesomeIcon icon={faStar} style={{ marginRight: "4px" }} /> Nađeni Ključevi
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "text.secondary", fontWeight: 600 }}>
                      Stari Grad, Sarajevo
                    </Typography>
                  </Box>
                </Box>

                {/* Marker 3 - User */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "48%",
                    left: "20%",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    border: "3px solid",
                    borderColor: "common.white",
                    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.15)",
                    zIndex: 10,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 26,
                      left: "50%",
                      transform: "translateX(-50%) translateY(0)",
                      bgcolor: "text.primary",
                      color: "common.white",
                      borderRadius: 1.5,
                      px: 1.2,
                      py: 0.6,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      whiteSpace: "nowrap",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      zIndex: 15,
                      textAlign: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} style={{ marginRight: "4px" }} /> Vaša lokacija
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
