import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function ProfileHeader() {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            letterSpacing: "0.15em",
            display: "block",
            lineHeight: 1.5,
          }}
        >
          Moj profil
        </Typography>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            mt: 0.5,
            mb: 1,
          }}
        >
          Profil korisnika
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pregledaj i ažuriraj svoje osnovne informacije.
        </Typography>
      </Box>
    </Box>
  );
}