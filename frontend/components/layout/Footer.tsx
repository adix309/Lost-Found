"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useI18n } from "@/components/i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();

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
            <Typography
              variant="h6"
              component="p"
              sx={{ fontWeight: 800, color: "#ffffff", mb: 1 }}
            >
              {t("app.name")}
            </Typography>

            <Typography
              variant="body2"
              color="grey.400"
              sx={{ maxWidth: "28rem", lineHeight: 1.6 }}
            >
              {t("footer.description")}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 750,
                color: "grey.500",
                display: "block",
                mb: 1,
                letterSpacing: "0.15em",
              }}
            >
              {t("footer.contact")}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="body2" color="grey.300">
                {t("footer.email")}: {t("footer.emailValue")}
              </Typography>

              <Typography variant="body2" color="grey.300">
                {t("footer.phone")}: {t("footer.phoneValue")}
              </Typography>

              <Typography variant="body2" color="grey.300">
                {t("footer.address")}: {t("footer.addressValue")}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}