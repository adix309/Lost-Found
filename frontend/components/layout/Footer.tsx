import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "secondary.dark",
        color: "secondary.light",
        borderTop: "1px solid",
        borderColor: "secondary.dark",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6, px: 3 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" component="p" sx={{ fontWeight: 800, color: "#ffffff", mb: 1 }}>
              Lost & Found
            </Typography>
            <Typography variant="body2" color="grey.400" sx={{ maxWidth: "28rem", lineHeight: 1.6 }}>
              Mjesto za prijavu izgubljenih i pronađenih predmeta, s
              fokusom na sigurnost, provjeru identiteta i povjerenje između
              korisnika.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="overline" sx={{ fontWeight: 750, color: "grey.500", display: "block", mb: 1, letterSpacing: "0.15em" }}>
              Kontakt
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="body2" color="grey.300">Email: info@lostfound.ba</Typography>
              <Typography variant="body2" color="grey.300">Telefon: +387 33 123 456</Typography>
              <Typography variant="body2" color="grey.300">Adresa: Zmaja od Bosne 33, Sarajevo</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
