"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faLightbulb, faXmark, faStar } from "@fortawesome/free-solid-svg-icons";
import type { Listing } from "@/types/listing";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORIES = [
  "Dokumenti",
  "Elektronika",
  "Odjeća",
  "Ključevi",
  "Novčanik",
  "Torbe",
  "Kućni ljubimci",
  "Ostalo",
] as const;

function AllItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [itemType, setItemType] = useState(() => searchParams.get("item_type") || "");
  const [category, setCategory] = useState(() => searchParams.get("category") || "");
  const [locationName, setLocationName] = useState(() => searchParams.get("location_name") || "");
  const [eventDate, setEventDate] = useState(() => searchParams.get("event_date") || "");

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/items`);

        if (!response.ok) {
          throw new Error("Greška pri dohvaćanju itema iz baze.");
        }

        const data: Listing[] = await response.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Nije moguće učitati oglase. Provjeri da li backend radi.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, []);

  const handleFilterChange = (
    key: string,
    value: string
  ) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/AllItems?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setItemType("");
    setCategory("");
    setLocationName("");
    setEventDate("");
    router.replace("/AllItems");
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (search) {
        const text = `${item.title} ${item.description} ${item.brand || ""} ${item.color || ""}`.toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
      }

      if (itemType && item.item_type !== itemType) {
        return false;
      }

      if (category && item.category !== category) {
        return false;
      }

      if (locationName) {
        const loc = (item.location_name || "").toLowerCase();
        if (!loc.includes(locationName.toLowerCase())) return false;
      }

      if (eventDate) {
        const itemDateStr = item.event_date ? item.event_date.slice(0, 10) : "";
        if (itemDateStr !== eventDate) return false;
      }

      return true;
    });
  }, [items, search, itemType, category, locationName, eventDate]);

  const hasActiveFilters = search || itemType || category || locationName || eventDate;
  const hasItems = filteredItems.length > 0;

  const filtersLayout = (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(27, 77, 62, 0.12)",
        bgcolor: "background.paper",
        p: 3,
        boxShadow: "0 15px 35px rgba(28, 25, 23, 0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        "&:hover": {
          transform: "none",
          boxShadow: "0 15px 35px rgba(28, 25, 23, 0.06)",
          borderColor: "rgba(27, 77, 62, 0.12)",
        },
      }}
    >
      <Box sx={{ display: "flex", bgcolor: "grey.100", p: 0.5, borderRadius: 2, width: "fit-content", gap: 0.5 }}>
        <Button
          onClick={() => {
            setItemType("");
            handleFilterChange("item_type", "");
          }}
          sx={{
            px: 2.5,
            py: 0.8,
            borderRadius: 1.5,
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "none",
            color: itemType === "" ? "white" : "text.secondary",
            bgcolor: itemType === "" ? "text.primary" : "transparent",
            "&:hover": {
              bgcolor: itemType === "" ? "text.primary" : "grey.200",
            },
          }}
        >
          Sve objave
        </Button>
        <Button
          onClick={() => {
            setItemType("lost");
            handleFilterChange("item_type", "lost");
          }}
          startIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
          sx={{
            px: 2.5,
            py: 0.8,
            borderRadius: 1.5,
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "none",
            color: itemType === "lost" ? "white" : "text.secondary",
            bgcolor: itemType === "lost" ? "error.main" : "transparent",
            boxShadow: itemType === "lost" ? "0 4px 10px rgba(122, 31, 43, 0.2)" : "none",
            "&:hover": {
              bgcolor: itemType === "lost" ? "error.dark" : "grey.200",
            },
          }}
        >
          Izgubljeno
        </Button>
        <Button
          onClick={() => {
            setItemType("found");
            handleFilterChange("item_type", "found");
          }}
          startIcon={<FontAwesomeIcon icon={faStar} />}
          sx={{
            px: 2.5,
            py: 0.8,
            borderRadius: 1.5,
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "none",
            color: itemType === "found" ? "white" : "text.secondary",
            bgcolor: itemType === "found" ? "primary.main" : "transparent",
            boxShadow: itemType === "found" ? "0 4px 10px rgba(27, 77, 62, 0.2)" : "none",
            "&:hover": {
              bgcolor: itemType === "found" ? "primary.dark" : "grey.200",
            },
          }}
        >
          Pronađeno
        </Button>
      </Box>

      <Grid container spacing={2.5} sx={{ alignItems: "flex-end" }}>
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1,
              display: "block",
            }}
          >
            Pretraga
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Ruksak, novčanik, brend..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange("search", e.target.value);
            }}
            slotProps={{
              htmlInput: { id: "filter-search" }
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1,
              display: "block",
            }}
          >
            Kategorija
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              id="filter-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                handleFilterChange("category", e.target.value);
              }}
              displayEmpty
            >
              <MenuItem value="">Sve kategorije</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1,
              display: "block",
            }}
          >
            Lokacija
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Npr. Sarajevo, SCC"
            value={locationName}
            onChange={(e) => {
              setLocationName(e.target.value);
              handleFilterChange("location_name", e.target.value);
            }}
            slotProps={{
              htmlInput: { id: "filter-location" }
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1,
              display: "block",
            }}
          >
            Datum
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="date"
            value={eventDate}
            onChange={(e) => {
              setEventDate(e.target.value);
              handleFilterChange("event_date", e.target.value);
            }}
            slotProps={{
              htmlInput: { id: "filter-date" }
            }}
          />
        </Grid>

        {hasActiveFilters && (
          <Grid size={{ xs: 12, md: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={resetFilters}
              sx={{ textTransform: "none", fontWeight: 700, height: "2.5rem" }}
            >
              Očisti
            </Button>
          </Grid>
        )}
      </Grid>
    </Card>
  );

  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Box
        component="section"
        sx={{
          position: "relative",
          background: "radial-gradient(circle at 50% -20%, rgba(27, 77, 62, 0.06) 0%, rgba(250, 250, 249, 1) 90%)",
          borderBottom: "1px solid",
          borderColor: "grey.200",
          py: { xs: 5, md: 7 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: 4.5 }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "primary.main",
                display: "block",
                mb: 1,
              }}
            >
              Pregled prijava
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                fontSize: { xs: "2rem", md: "2.5rem" },
                letterSpacing: "-0.03em",
              }}
            >
              Izgubljeni i pronađeni predmeti
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1.5,
                color: "text.secondary",
                maxWidth: "44rem",
                lineHeight: 1.6,
              }}
            >
              Pretražite bazu aktivnih prijava. Koristite filtere ispod da biste lakše pronašli ono što tražite.
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              endIcon={
                showMobileFilters ? (
                  <FontAwesomeIcon icon={faXmark} />
                ) : (
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                )
              }
              sx={{ fontWeight: 700, textTransform: "none", py: 1.2 }}
            >
              {showMobileFilters ? "Sakrij filtere" : "Prikaži filtere i pretragu"}
            </Button>
          </Box>

          <Box sx={{ display: { xs: "none", md: "block" } }}>{filtersLayout}</Box>

          <Collapse in={showMobileFilters} sx={{ display: { xs: "block", md: "none" } }}>
            <Box sx={{ mt: 2 }}>{filtersLayout}</Box>
          </Collapse>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: "background.paper", py: 7 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          {isLoading && (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Grid key={n} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ height: 280, display: "flex", flexDirection: "column", borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
                    <Skeleton variant="rectangular" height={190} />
                    <CardContent sx={{ flexGrow: 1, p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Skeleton variant="text" width="70%" height={24} />
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="50%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {!isLoading && !error && !hasItems && (
            <Card
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: "center",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "grey.200",
                maxWidth: "38rem",
                mx: "auto",
                boxShadow: "0 10px 30px rgba(28, 25, 23, 0.04)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                borderBottom: "3px solid",
                borderBottomColor: "primary.main",
              }}
            >
              <Box sx={{ fontSize: "3rem", color: "primary.main", animation: "pulseEmoji 3s infinite ease-in-out" }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.01em" }}>
                Nema pronađenih oglasa
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, maxWidth: "32rem" }}>
                Pokušajte prilagoditi filtere ili pretragu. Neko je možda koristio drugačije riječi za opis predmeta.
              </Typography>

              <Card variant="outlined" sx={{ width: "100%", mt: 2, p: 2.5, bgcolor: "grey.50", textAlign: "left", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <FontAwesomeIcon icon={faLightbulb} style={{ color: "#1b4d3e" }} /> Savjeti za pretragu:
                </Typography>
                <Stack spacing={1} component="ul" sx={{ pl: 2.5, m: 0, fontSize: "0.85rem", color: "text.secondary" }}>
                  <li>Koristite kraće pojmove (npr. "ključ" umjesto "izgubljeni ključevi")</li>
                  <li>Provjerite drugu kategoriju ili uklonite datumski filter</li>
                  <li>Pretražite lokacije na mapi za širi geografski uvid</li>
                </Stack>
              </Card>

              {hasActiveFilters && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={resetFilters}
                  sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
                >
                  Očisti filtere i prikaži sve
                </Button>
              )}
            </Card>
          )}

          {!isLoading && !error && hasItems && (
            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ListingCard listing={item} isFeatured={false} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default function AllItemsPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      <Suspense
        fallback={
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              Učitavanje pretrage...
            </Typography>
          </Container>
        }
      >
        <AllItemsContent />
      </Suspense>
      <Footer />
    </Box>
  );
}