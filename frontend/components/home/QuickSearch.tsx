"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

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

export function QuickSearch() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [itemType, setItemType] = useState("");
  const [category, setCategory] = useState("");
  const [locationName, setLocationName] = useState("");
  const [eventDate, setEventDate] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (itemType) params.append("item_type", itemType);
    if (category) params.append("category", category);
    if (locationName) params.append("location_name", locationName);
    if (eventDate) params.append("event_date", eventDate);

    router.push(`/AllItems?${params.toString()}`);
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        zIndex: 10,
        marginTop: { xs: "-2.5rem", sm: "-4.5rem" },
        bgcolor: "transparent",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Card
          component="form"
          onSubmit={handleSubmit}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "rgba(27, 77, 62, 0.15)",
            bgcolor: "background.paper",
            p: { xs: 3, md: 4 },
            boxShadow: "0 20px 50px rgba(28, 25, 23, 0.12)",
            "&:hover": {
              transform: "none",
              boxShadow: "0 20px 50px rgba(28, 25, 23, 0.12)",
              borderColor: "rgba(27, 77, 62, 0.15)",
            },
          }}
        >
          <Grid container spacing={2} sx={{ alignItems: "flex-end" }}>
            <Grid size={{ xs: 12, md: 6, lg: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  mb: 1,
                  display: "block",
                }}
              >
                Pretraga
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Npr. ključevi, iPhone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  htmlInput: { id: "qs-search" }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.8 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  mb: 1,
                  display: "block",
                }}
              >
                Tip predmeta
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  id="qs-type"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Svi tipovi</MenuItem>
                  <MenuItem value="lost">Izgubljeno</MenuItem>
                  <MenuItem value="found">Pronađeno</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.8 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  mb: 1,
                  display: "block",
                }}
              >
                Kategorija
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  id="qs-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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

            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.8 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
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
                onChange={(e) => setLocationName(e.target.value)}
                slotProps={{
                  htmlInput: { id: "qs-location" }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
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
                onChange={(e) => setEventDate(e.target.value)}
                slotProps={{
                  htmlInput: { id: "qs-date" }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  height: "2.5rem",
                  fontWeight: 700,
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Pretraži
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}
