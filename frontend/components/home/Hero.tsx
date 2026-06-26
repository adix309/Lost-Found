"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshake, faHeart, faMagnifyingGlass, faStar } from "@fortawesome/free-solid-svg-icons";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export function Hero() {
  const router = useRouter();

  const handleAddItemClick = (event: React.MouseEvent, type: "lost" | "found") => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      event.preventDefault();
      router.push("/login");
    }
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        background: "radial-gradient(circle at 50% -20%, rgba(27, 77, 62, 0.08) 0%, rgba(250, 250, 249, 1) 80%)",
        borderBottom: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Background glow blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "5%",
          width: 380,
          height: 380,
          background: "radial-gradient(circle, rgba(27, 77, 62, 0.06) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          right: "5%",
          width: 440,
          height: 440,
          background: "radial-gradient(circle, rgba(122, 31, 43, 0.04) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: { xs: 7, md: 11 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            maxWidth: "48rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            mb: { xs: 7, md: 11 },
          }}
        >
          {/* Badge */}


          {/* Title */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 850,
              lineHeight: 1.15,
              color: "text.primary",
              letterSpacing: "-0.03em",
              fontSize: { xs: "2.25rem", md: "3rem" },
            }}
          >
            Izgubili ste nešto?
            Ili pronašli tuđi predmet?

          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              mt: 3,
              fontSize: "1.125rem",
              lineHeight: 1.7,
              color: "text.secondary",
              maxWidth: "44rem",
            }}
          >
            Gubitak stvari može biti izuzetno stresan, ali niste sami. Naša zajednica nalazača i vlasnika je tu da vam pomogne da brzo i sigurno vratite ono što vam pripada.
          </Typography>

          {/* Trust indicator */}
          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(5, 150, 105, 0.05)",
              px: 2.5,
              py: 1.1,
              borderRadius: 999,
              fontSize: "0.9rem",
              color: "success.dark",
              border: "1px solid",
              borderColor: "rgba(5, 150, 105, 0.1)",
              boxShadow: "0 2px 6px rgba(5, 150, 105, 0.02)",
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: "1.1rem",
                display: "inline-block",
                animation: "pulseEmoji 2s infinite ease-in-out",
                "@keyframes pulseEmoji": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.2)" },
                },
              }}
            >
              <FontAwesomeIcon icon={faHandshake} style={{ color: "#1b4d3e" }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: "inherit" }}>
              Do sada je <strong>1,240+ predmeta</strong> uspješno vraćeno vlasnicima u našoj zajednici.
            </Typography>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              mt: 5,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2.5,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              component={Link}
              href="/AddItem?type=lost"
              variant="contained"
              size="large"
              onClick={(event) => handleAddItemClick(event, "lost")}
              startIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
              sx={{
                px: 4.5,
                py: 2,
                fontSize: "1.05rem",
                fontWeight: 700,
                borderRadius: 3,
                textTransform: "none",
                bgcolor: "error.main",
                color: "white",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: "translateY(0)",
                "&:hover": {
                  bgcolor: "error.dark",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(122, 31, 43, 0.25)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Izgubio/la sam nešto
            </Button>
            <Button
              component={Link}
              href="/AddItem?type=found"
              variant="contained"
              color="primary"
              size="large"
              onClick={(event) => handleAddItemClick(event, "found")}
              startIcon={<FontAwesomeIcon icon={faStar} />}
              sx={{
                px: 4.5,
                py: 2,
                fontSize: "1.05rem",
                fontWeight: 700,
                borderRadius: 3,
                textTransform: "none",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: "translateY(0)",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(27, 77, 62, 0.25)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Pronašao/la sam nešto
            </Button>
          </Box>
        </Box>

        {/* Steps section */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "64rem",
            borderTop: "1px dashed",
            borderColor: "grey.200",
            pt: 0,
            pb: { xs: 6, md: 9 },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "text.secondary",
              textAlign: "center",
              display: "block",
            }}
          >
            Kako platforma funkcioniše
          </Typography>
          <Typography
            variant="h4"
            sx={{
              mt: 1,
              mb: 6,
              fontWeight: 800,
              color: "text.primary",
              textAlign: "center",
              letterSpacing: "-0.01em",
              fontSize: { xs: "1.5rem", md: "1.75rem" },
            }}
          >
            Sve se rješava u tri jednostavna koraka
          </Typography>

          <Grid container spacing={4}>
            {/* Step 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(28, 25, 23, 0.02)",
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    bgcolor: "transparent",
                    transition: "background-color 0.3s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 40px rgba(28, 25, 23, 0.06)",
                    borderColor: "grey.300",
                    "&::after": {
                      bgcolor: "primary.main",
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      mb: 3,
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.02)",
                      bgcolor: "primary.light",
                      color: "primary.main",
                    }}
                  >
                    1
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                    Objavite oglas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Unesite detalje, boju, brend, slike i označite tačno mjesto na mapi.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Step 2 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(28, 25, 23, 0.02)",
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    bgcolor: "transparent",
                    transition: "background-color 0.3s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 40px rgba(28, 25, 23, 0.06)",
                    borderColor: "grey.300",
                    "&::after": {
                      bgcolor: "primary.main",
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      mb: 3,
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.02)",
                      bgcolor: "primary.light",
                      color: "primary.main",
                    }}
                  >
                    2
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                    Pametno podudaranje
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Naš sistem automatski analizira opise i šalje obavijest ako prepozna slične predmete.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Step 3 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(28, 25, 23, 0.02)",
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    bgcolor: "transparent",
                    transition: "background-color 0.3s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 40px rgba(28, 25, 23, 0.06)",
                    borderColor: "grey.300",
                    "&::after": {
                      bgcolor: "primary.main",
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      mb: 3,
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.02)",
                      bgcolor: "success.light",
                      color: "success.main",
                    }}
                  >
                    3
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                    Siguran povrat
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Verifikujte vlasništvo kroz skrivene detalje i dogovorite preuzimanje.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
