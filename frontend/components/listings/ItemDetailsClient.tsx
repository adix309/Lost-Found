"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faPhone, faEnvelope, faUser, faRobot, faArrowUp, faChevronDown, faMapLocationDot, faFileInvoice } from "@fortawesome/free-solid-svg-icons";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StartChatButton } from "@/components/chat/StartChatButton";
import { AiMatchBadge } from "@/components/matching/AiMatchBadge";
import { AiSimilarityBar } from "@/components/matching/AiSimilarityBar";
import { AiSimilarityLabel } from "@/components/matching/AiSimilarityLabel";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Alert from "@mui/material/Alert";
import type { Listing } from "@/types/listing";
import { ClaimSubmissionDialog } from "@/components/listings/ClaimSubmissionDialog";
import { ClaimStatusBadge } from "@/components/common/ClaimStatusBadge";
import type { Claim } from "@/types/claim";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type ItemOwner = {
  id: number;
  username?: string;
  full_name?: string;
  email?: string;
  profile_image?: string | null;
};

type ListingDetails = Listing & {
  user?: ItemOwner | null;
  owner?: ItemOwner | null;
  posted_by?: ItemOwner | null;
  user_id?: number;
};

interface ItemDetailsClientProps {
  item: ListingDetails;
  aiChecked: boolean;
  hasAiParam: boolean;
  similarityVal: number | null;
  rankImproved: boolean;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Nije navedeno";
  }

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

function getImageSrc(imageUrl?: string | null) {
  if (!imageUrl) {
    return "/no-image.jpg";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}

function getOwner(item: ListingDetails) {
  return item.user || item.owner || item.posted_by || null;
}

export function ItemDetailsClient({
  item,
  aiChecked,
  hasAiParam,
  similarityVal,
  rankImproved,
}: ItemDetailsClientProps) {
  const typeLabel = item.item_type === "lost" ? "Izgubljeno" : "Pronađeno";
  const owner = getOwner(item);
  const isResolved = item.status === "resolved";

  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const fetchData = async () => {
      setLoadingClaims(true);
      try {
        const [meRes, claimsRes, convRes] = await Promise.all([
          fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/claims/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/conversations/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData);
        }
        if (claimsRes.ok) {
          const claimsData = await claimsRes.json();
          setMyClaims(claimsData || []);
        }
        if (convRes && convRes.ok) {
          const convs = await convRes.json();
          const activeConv = convs.find((c: any) => c.item.id === item.id);
          if (activeConv) {
            setActiveConversationId(activeConv.conversationId);
          }
        }
      } catch (err) {
        console.error("Greška pri učitavanju claim podataka:", err);
      } finally {
        setLoadingClaims(false);
      }
    };

    fetchData();
  }, [item.id]);

  const handleClaimSuccess = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch(`${API_URL}/claims/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMyClaims(data))
      .catch((err) => console.error("Greška pri osvježavanju claimova:", err));
  };

  const imageSrc = getImageSrc(item.image_url);
  const imageAlt = item.image_url ? item.title : "Slika nije dodana";

  const ownerDisplayName =
    owner?.full_name || owner?.username || owner?.email || "Nepoznat korisnik";

  const ownerImageSrc = getImageSrc(owner?.profile_image);
  const hasMapLocation =
    item.latitude !== null &&
    item.longitude !== null &&
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Details Hero Section */}
        <Box
          component="section"
          sx={{
            position: "relative",
            background: "radial-gradient(circle at 50% -20%, rgba(27, 77, 62, 0.05) 0%, rgba(250, 250, 249, 1) 90%)",
            borderBottom: "1px solid",
            borderColor: "grey.200",
            py: 3,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
            <Chip
              label={typeLabel}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                bgcolor: item.item_type === "lost" ? "error.light" : "success.light",
                color: item.item_type === "lost" ? "error.dark" : "success.dark",
                border: "1px solid",
                borderColor: item.item_type === "lost" ? "error.main" : "success.main",
                mb: 1.5,
              }}
            />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                fontSize: { xs: "1.75rem", md: "2.25rem" },
                letterSpacing: "-0.02em",
              }}
            >
              {item.title}
            </Typography>
          </Container>
        </Box>

        {/* Grid Section */}
        <Box component="section" sx={{ bgcolor: "background.paper", py: 4 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
            <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
              {/* Left Column - Main Content */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={3}>
                  {/* Image Card */}
                  <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)" }}>
                    <Box sx={{ position: "relative", width: "100%", height: { xs: 260, sm: 360, md: 400 }, bgcolor: "grey.50" }}>
                      <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 900px) 100vw, 900px"
                        unoptimized
                        priority
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  </Card>

                  {/* Description Card */}
                  <Card sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", boxShadow: "0 4px 12px rgba(28, 25, 23, 0.02)" }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1.5, fontSize: "1.1rem" }}>
                      Opis predmeta
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6, whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
                      {item.description}
                    </Typography>
                  </Card>

                  {/* AI Result Card */}
                  {aiChecked && (
                    <Card sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "rgba(27, 77, 62, 0.2)", bgcolor: "rgba(27, 77, 62, 0.02)", boxShadow: "0 4px 12px rgba(27, 77, 62, 0.02)" }}>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "teal.800", display: "flex", alignItems: "center", gap: 1, fontSize: "1.05rem" }}>
                          <FontAwesomeIcon icon={faRobot} style={{ color: "#1b4d3e" }} />
                          Dodatna AI provjera slika
                        </Typography>
                        <AiMatchBadge label="AI checked" />
                      </Stack>

                      {similarityVal !== null ? (
                        <Stack spacing={2}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                              Vizuelna sličnost:
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "primary.main" }}>
                              {Math.round(similarityVal <= 1 ? similarityVal * 100 : similarityVal)}%
                            </Typography>
                          </Box>

                          <Box>
                            <AiSimilarityBar score={similarityVal} />
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                              Procjena nivoa sličnosti:
                            </Typography>
                            <AiSimilarityLabel score={similarityVal} />
                          </Box>

                          {rankImproved && (
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                                Rangiranje:
                              </Typography>
                              <Chip
                                icon={<FontAwesomeIcon icon={faArrowUp} style={{ fontSize: "0.75rem", color: "#1b4d3e" }} />}
                                label="Rank poboljšan nakon vizuelne provjere"
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: "success.light",
                                  color: "success.dark",
                                  borderRadius: 1.5,
                                }}
                              />
                            </Box>
                          )}

                          <Divider sx={{ my: 1 }} />

                          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "grey.100" }}>
                            <Typography variant="caption" sx={{ display: "block", color: "text.primary", fontWeight: 700, mb: 0.5, fontSize: "0.75rem" }}>
                              Šta ovo znači?
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mb: 1 }}>
                              Ova vrijednost pokazuje koliko slike djeluju vizuelno slično. Ne potvrđuje vlasništvo i služi samo kao dodatni signal uz opis predmeta.
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", color: "error.main", fontWeight: 700, mb: 0.5, fontSize: "0.75rem" }}>
                              Napomena:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                              AI rezultat predstavlja vjerovatnoću/sličnost, a ne dokaz vlasništva. Kontakt i primopredaja predmeta i dalje zavise od verifikacije.
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                          Nema dovoljno slika za vizuelno poređenje. Rezultat je prikazan na osnovu opisa i ostalih podataka.
                        </Typography>
                      )}
                    </Card>
                  )}

                  {/* AI Checked false fallback */}
                  {hasAiParam && !aiChecked && (
                    <Card sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", bgcolor: "grey.50" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "text.secondary", display: "flex", alignItems: "center", gap: 1, mb: 1.5, fontSize: "1.05rem" }}>
                        <FontAwesomeIcon icon={faRobot} style={{ color: "grey.400" }} />
                        AI provjera slika nije dostupna
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                        AI provjera slika nije rađena ili nije dostupna za ovaj oglas (nema dovoljno slika za vizuelno poređenje). Prikazano na osnovu opisa i lokacije.
                      </Typography>
                    </Card>
                  )}
                </Stack>
              </Grid>

              {/* Right Column - Side Panel */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3} sx={{ position: { md: "sticky" }, top: { md: "6.5rem" } }}>
                  {/* Detailed Info & Contact Card */}
                  <Card sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", boxShadow: "0 10px 30px rgba(28, 25, 23, 0.03)" }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 2, fontSize: "1.1rem" }}>
                      Detalji i kontakt
                    </Typography>
                    
                    {/* Metadata Table */}
                    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Status oglasa</Typography>
                        <StatusBadge status={item.status} />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Kategorija</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.category}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Lokacija</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.location_name || "Lokacija nije navedena"}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Datum događaja</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{formatDateTime(item.event_date)}</Typography>
                      </Box>
                      {item.color && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Boja</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.color}</Typography>
                        </Box>
                      )}
                      {item.brand && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Brend</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.brand}</Typography>
                        </Box>
                      )}
                      {item.reward_amount !== null && item.reward_amount !== undefined && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Nagrada</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main", fontSize: "0.9rem" }}>{item.reward_amount} KM</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>Objavljeno</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{formatDateTime(item.created_at)}</Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Owner Profile Block */}
                    <Box sx={{ mb: 2.5 }}>
                      {owner ? (
                        <Box
                          component={Link}
                          href={`/profile/${owner.id}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "grey.100",
                            textDecoration: "none",
                            color: "inherit",
                            transition: "border-color 0.2s",
                            "&:hover": { borderColor: "primary.main" },
                          }}
                        >
                          <Avatar src={ownerImageSrc} sx={{ width: 40, height: 40 }} alt={ownerDisplayName}>
                            {ownerDisplayName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ overflow: "hidden" }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ownerDisplayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              Vlasnik oglasa &bull; Pogledaj profil &rarr;
                            </Typography>
                          </Box>
                        </Box>
                      ) : item.user_id ? (
                        <Box
                          component={Link}
                          href={`/profile/${item.user_id}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "grey.100",
                            textDecoration: "none",
                            color: "inherit",
                            transition: "border-color 0.2s",
                            "&:hover": { borderColor: "primary.main" },
                          }}
                        >
                          <Avatar sx={{ width: 40, height: 40, bgcolor: "grey.200", color: "text.primary" }}>
                            <FontAwesomeIcon icon={faUser} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                              Korisnik #{item.user_id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              Pogledaj profil &rarr;
                            </Typography>
                          </Box>
                        </Box>
                      ) : null}
                    </Box>

                    {/* Actions List */}
                    <Stack spacing={1.5}>
                      {hasMapLocation && (
                        <Button
                          component={Link}
                          href={`/map?focusedItem=${item.id}`}
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<FontAwesomeIcon icon={faMapLocationDot} />}
                          sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                        >
                          Idi na mapu
                        </Button>
                      )}

                      {isResolved ? (
                        <Alert severity="success" sx={{ borderRadius: 2, fontWeight: 700 }}>
                          Ovaj predmet je vraćen i oglas je uspješno riješen.
                        </Alert>
                      ) : currentUser && currentUser.id === item.user_id ? (
                        <Button
                          component={Link}
                          href="/AllChats"
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                        >
                          Upravljaj porukama i zahtjevima
                        </Button>
                      ) : (() => {
                        const activeClaim = myClaims.find(
                          (c) => c.item_id === item.id && c.status !== "rejected" && c.status !== "cancelled"
                        );

                        if (activeClaim) {
                          return (
                            <Box sx={{ p: 2, border: "1px solid", borderColor: "grey.200", borderRadius: 2, bgcolor: "grey.50" }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", mb: 1, fontSize: "0.85rem" }}>
                                Zahtjev za povrat podnesen:
                              </Typography>
                              <Box sx={{ mb: 1.5 }}>
                                <ClaimStatusBadge status={activeClaim.status} />
                              </Box>
                              {activeConversationId ? (
                                <Button
                                  component={Link}
                                  href={`/chat/${activeConversationId}`}
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  fullWidth
                                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                                >
                                  Otvori chat i zahtjev
                                </Button>
                              ) : (
                                <StartChatButton itemId={item.id} />
                              )}
                            </Box>
                          );
                        }

                        return (
                          <>
                            {item.item_type === "found" && (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<FontAwesomeIcon icon={faFileInvoice} />}
                                onClick={() => {
                                  if (!currentUser) {
                                    router.push("/login");
                                  } else {
                                    setIsClaimDialogOpen(true);
                                  }
                                }}
                                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                              >
                                Podnesi zahtjev za povrat (Claim)
                              </Button>
                            )}
                            <StartChatButton itemId={item.id} />
                          </>
                        );
                      })()}

                      {/* Secondary Action Buttons */}
                      {item.contact_phone && (
                        <Button
                          component="a"
                          href={`tel:${item.contact_phone}`}
                          variant="outlined"
                          color="secondary"
                          size="small"
                          startIcon={<FontAwesomeIcon icon={faPhone} />}
                          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                        >
                          Pozovi ({item.contact_phone})
                        </Button>
                      )}
                      {item.contact_email && (
                        <Button
                          component="a"
                          href={`mailto:${item.contact_email}`}
                          variant="outlined"
                          color="secondary"
                          size="small"
                          startIcon={<FontAwesomeIcon icon={faEnvelope} />}
                          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                        >
                          Pošalji Email
                        </Button>
                      )}
                    </Stack>

                    <ClaimSubmissionDialog
                      itemId={item.id}
                      itemTitle={item.title}
                      open={isClaimDialogOpen}
                      onClose={() => setIsClaimDialogOpen(false)}
                      onSuccess={handleClaimSuccess}
                    />
                  </Card>

                  {/* Safety Guidelines Accordion */}
                  <Accordion
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "rgba(27, 77, 62, 0.12)",
                      borderLeft: "4px solid",
                      borderLeftColor: "primary.main",
                      borderRadius: "12px !important",
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(28, 25, 23, 0.03)",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<FontAwesomeIcon icon={faChevronDown} style={{ color: "#1b4d3e" }} />}
                      sx={{ px: 2, py: 0.5 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "teal.800", display: "flex", alignItems: "center", gap: 1, fontSize: "0.9rem" }}>
                        <FontAwesomeIcon icon={faShieldHalved} /> Sigurna primopredaja
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Stack spacing={1} component="ul" sx={{ pl: 2, m: 0, fontSize: "0.8rem", color: "text.secondary" }}>
                        <Typography component="li" sx={{ fontSize: "0.8rem" }}>
                          Sastajte se isključivo na <strong>javnim i osvijetljenim mjestima</strong>.
                        </Typography>
                        <Typography component="li" sx={{ fontSize: "0.8rem" }}>
                          <strong>Nikada ne šaljite novac unaprijed</strong> za dostavu ili kao nagradu.
                        </Typography>
                        <Typography component="li" sx={{ fontSize: "0.8rem" }}>
                          Preporučujemo da <strong>povedete nekoga sa sobom</strong>.
                        </Typography>
                        <Typography component="li" sx={{ fontSize: "0.8rem" }}>
                          Vlasništvo nad predmetom potvrdite tražeći <strong>detalje koji nisu u oglasu</strong>.
                        </Typography>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
