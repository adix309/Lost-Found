"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { categoryKeys, type CategoryKey } from "@/i18n/categories";
import { useI18n } from "@/components/i18n/I18nProvider";

const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker"),
  {
    ssr: false,
    loading: () => <p>Učitavanje mape...</p>,
  },
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

const CATEGORY_OPTIONS = CATEGORIES.map((_, index) => categoryKeys[index]) as CategoryKey[];

type ItemType = "lost" | "found";

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "detail" in payload &&
    typeof payload.detail === "string"
  ) {
    return payload.detail;
  }

  return fallback;
}

function getNetworkErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return `Nije moguće povezati se sa backend serverom na ${API_BASE_URL}. Provjeri da li backend radi i da li je NEXT_PUBLIC_API_BASE_URL/NEXT_PUBLIC_API_URL ispravno podešen.`;
  }

  return null;
}

type HiddenUniqueFeatures = Record<string, unknown> | null;

type GeocodeResult = {
  lat: string;
  lon: string;
};

function cleanOptionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseHiddenUniqueFeatures(
  rawValue: FormDataEntryValue | null,
): HiddenUniqueFeatures {
  if (typeof rawValue !== "string") return null;

  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    throw new Error("hidden_unique_features mora biti JSON objekat.");
  } catch {
    return {
      notes: trimmed,
    };
  }
}

function AddItemPageContent() {
  const router = useRouter();
  const { t, localizeHref } = useI18n();

  const searchParams = useSearchParams();
  const initialType: ItemType = searchParams.get("type") === "found" ? "found" : "lost";
  const [itemType, setItemType] = useState<ItemType>(initialType);


  const [category, setCategory] = useState<CategoryKey>("documents");
  const [customCategory, setCustomCategory] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [locationLookupError, setLocationLookupError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [verificationEnabled, setVerificationEnabled] = useState(false);
  const [verificationQuestions, setVerificationQuestions] = useState<string[]>([""]);


  const bannerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const imagePreviews = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if ((success || error) && bannerRef.current) {
      bannerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [success, error]);

  useEffect(() => {
    const trimmedLocation = locationName.trim();

    if (!trimmedLocation || trimmedLocation.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsGeocodingLocation(true);
      setLocationLookupError("");

      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          limit: "1",
          q: trimmedLocation,
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Location lookup failed");
        }

        const results = (await response.json()) as GeocodeResult[];
        const bestMatch = results[0];

        if (!bestMatch) {
          setLocationLookupError("Lokacija nije pronadjena. Mozes kliknuti na mapu.");
          return;
        }

        const nextLatitude = Number(bestMatch.lat);
        const nextLongitude = Number(bestMatch.lon);

        if (Number.isFinite(nextLatitude) && Number.isFinite(nextLongitude)) {
          setLatitude(nextLatitude);
          setLongitude(nextLongitude);
        }
      } catch (lookupError) {
        if (lookupError instanceof DOMException && lookupError.name === "AbortError") {
          return;
        }

        setLocationLookupError("Lokacija nije pronadjena. Mozes kliknuti na mapu.");
      } finally {
        setIsGeocodingLocation(false);
      }
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [locationName]);


  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(event.target.files || []));
    event.target.value = "";
  }

  function handleItemTypeChange(nextItemType: ItemType) {
    setItemType(nextItemType);

    if (nextItemType !== "found") {
      setVerificationEnabled(false);
      setVerificationQuestions([""]);
    }
  }

  function handleLocationNameChange(value: string) {
    setLocationName(value);
    setLocationLookupError("");

    if (value.trim().length < 3) {
      setIsGeocodingLocation(false);
      setLatitude(null);
      setLongitude(null);
    }
  }

  function removeImage(index: number) {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  function resetForm() {
    formRef.current?.reset();
    setItemType(initialType);
    setCategory("documents");
    setCustomCategory("");
    setLocationName("");
    setLatitude(null);
    setLongitude(null);
    setIsGeocodingLocation(false);
    setLocationLookupError("");
    setImages([]);
    setVerificationEnabled(false);
    setVerificationQuestions([""]);
    setError("");
    setSuccess("");
  }

  function clearLocation() {
    setLocationName("");
    setLatitude(null);
    setLongitude(null);
    setLocationLookupError("");
    setIsGeocodingLocation(false);
  }


  function addVerificationQuestion() {
    setVerificationQuestions((current) => [...current, ""]);
  }

  function updateVerificationQuestion(index: number, value: string) {
    setVerificationQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? value : question,
      ),
    );
  }

  function removeVerificationQuestion(index: number) {
    setVerificationQuestions((current) => {
      const nextQuestions = current.filter((_, questionIndex) => questionIndex !== index);
      return nextQuestions.length > 0 ? nextQuestions : [""];
    });
  }


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Moraš biti prijavljen da dodaš predmet.");
      setTimeout(() => router.push(localizeHref("/login")), 1200);
      return;
    }

    const resolvedCategory =
      category === "other" ? customCategory.trim() : category;

    if (!resolvedCategory) {
      setError("Unesi drugu kategoriju predmeta.");
      return;
    }

    const cleanedVerificationQuestions = verificationQuestions
      .map((question) => question.trim())
      .filter(Boolean);

    if (itemType === "found" && verificationEnabled && cleanedVerificationQuestions.length === 0) {
      setError("Dodaj barem jedno verifikaciono pitanje ili isključi opciju.");
      return;
    }


    const formData = new FormData(event.currentTarget);
    const eventDate = formData.get("event_date");

    const itemData = {
      title: formData.get("title"),
      description: formData.get("description"),
      item_type: itemType,
      category: resolvedCategory,
      location_name: cleanOptionalString(formData.get("location_name")) ?? "",
      latitude,
      longitude,
      event_date:
        typeof eventDate === "string" && eventDate
          ? new Date(eventDate).toISOString()
          : null,
      image_url: null,
      brand: cleanOptionalString(formData.get("brand")),
      color: cleanOptionalString(formData.get("color")),
      reward_amount:
        itemType === "lost" && formData.get("reward_amount")
          ? Number(formData.get("reward_amount"))
          : null,
      contact_phone: cleanOptionalString(formData.get("contact_phone")),
      contact_email: cleanOptionalString(formData.get("contact_email")),
      hidden_unique_features: (parseHiddenUniqueFeatures(
        formData.get("hidden_unique_features")) ?? {}),
    };

    setIsSubmitting(true);

    try {
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/`, {
          method: "GET",
        });

        if (!healthResponse.ok) {
          throw new Error("Backend health check failed");
        }
      } catch (networkError) {
        throw new Error(
          getNetworkErrorMessage(networkError) ||
          `Backend server nije dostupan na ${API_BASE_URL}.`,
        );
      }

      const createResponse = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      });

      const createdItem = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(
          getErrorMessage(createdItem, "Greška prilikom dodavanja predmeta."),
        );
      }

      if (itemType === "found") {
        const questionsPayload = verificationEnabled
          ? cleanedVerificationQuestions.map((question) => ({
            question_text: question,
          }))
          : [];

        const questionsResponse = await fetch(
          `${API_BASE_URL}/verification-questions/items/${createdItem.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              questions: questionsPayload,
            }),
          },
        );

        const questionsResult = await questionsResponse.json();

        if (!questionsResponse.ok) {
          throw new Error(
            getErrorMessage(
              questionsResult,
              "Predmet je kreiran, ali verifikaciona pitanja nisu spremljena.",
            ),
          );
        }
      }


      if (images.length > 0) {
        const uploadFormData = new FormData();
        images.forEach((image) => uploadFormData.append("images", image));

        const uploadResponse = await fetch(
          `${API_BASE_URL}/items/${createdItem.id}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          },
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            getErrorMessage(
              uploadResult,
              "Predmet je kreiran, ali slike nisu uspješno uploadovane.",
            ),
          );
        }
      }

      setSuccess(
        images.length > 0
          ? "Predmet i slike su uspješno dodani."
          : "Predmet je uspješno dodan.",
      );
      setTimeout(() => router.push(localizeHref(`/AllItems/${createdItem.id}`)), 1200);
    } catch (submitError) {
      console.error("Greška pri dodavanju predmeta:", submitError);
      const networkErrorMessage = getNetworkErrorMessage(submitError);
      setError(
        networkErrorMessage ||
        (submitError instanceof Error
          ? submitError.message
          : "Greška prilikom dodavanja predmeta."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box ref={bannerRef}>
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                mt: 0.5,
                letterSpacing: "-0.02em",
                fontSize: { xs: "2.25rem", md: "2.75rem" },
              }}
            >
              Dodaj novi predmet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              Popuni podatke za izgubljeni ili pronađeni predmet.
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 4 }}>
                Informacije o predmetu
              </Typography>

              <Box
                component="form"
                ref={formRef}
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", fontSize: "0.75rem" }}>
                    Tip oglasa*
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card
                        onClick={() => handleItemTypeChange("lost")}
                        sx={{
                          cursor: "pointer",
                          border: "2px solid",
                          borderColor: itemType === "lost" ? "error.main" : "grey.200",
                          bgcolor: itemType === "lost" ? "error.light" : "background.paper",
                          p: 3,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            borderColor: itemType === "lost" ? "error.main" : "grey.300",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 24px rgba(28, 25, 23, 0.06)",
                          },
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                          Izgubio sam predmet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.4 }}>
                          Objavi predmet koji pokušavaš pronaći.
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card
                        onClick={() => handleItemTypeChange("found")}
                        sx={{
                          cursor: "pointer",
                          border: "2px solid",
                          borderColor: itemType === "found" ? "primary.main" : "grey.200",
                          bgcolor: itemType === "found" ? "primary.light" : "background.paper",
                          p: 3,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            borderColor: itemType === "found" ? "primary.main" : "grey.300",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 24px rgba(28, 25, 23, 0.06)",
                          },
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                          Pronašao sam predmet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.4 }}>
                          Objavi predmet i pomozi vlasniku da ga pronađe.
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="title"
                      name="title"
                      label="Naziv predmeta"
                      placeholder="Npr. novčanik, ključevi, telefon..."
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="category"
                      name="category"
                      select
                      label="Kategorija"
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value as CategoryKey,
                        )
                      }
                      required
                      fullWidth
                    >
                      {CATEGORY_OPTIONS.map((categoryOption) => (
                        <MenuItem key={categoryOption} value={categoryOption}>
                          {t(`categories.${categoryOption}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                {category === "other" && (
                  <TextField
                    id="custom_category"
                    label="Druga kategorija*"
                    value={customCategory}
                    onChange={(event) => setCustomCategory(event.target.value)}
                    placeholder="Unesi kategoriju predmeta"
                    required
                    fullWidth
                  />
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: { xs: 2.5, md: 3 },
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                  }}
                >
                  <TextField
                    id="location_name"
                    name="location_name"
                    label="Lokacija predmeta"
                    placeholder="Npr. SCC Sarajevo"
                    value={locationName}
                    onChange={(event) => handleLocationNameChange(event.target.value)}
                    fullWidth
                  />

                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationClear={clearLocation}
                    onLocationSelect={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                      setLocationLookupError("");
                    }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    Upiši lokaciju za automatsko pozicioniranje ili klikni na mapu. Lokacija nije obavezna.
                  </Typography>
                  {isGeocodingLocation && (
                    <Typography variant="caption" color="text.secondary">
                      Traženje lokacije...
                    </Typography>
                  )}
                  {locationLookupError && (
                    <Typography variant="caption" color="error.main">
                      {locationLookupError}
                    </Typography>
                  )}
                  {latitude !== null && longitude !== null && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { xs: "flex-start", sm: "center" } }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                        Odabrana lokacija: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </Typography>
                      <Button type="button" size="small" variant="outlined" color="error" onClick={clearLocation}>
                        Ukloni lokaciju
                      </Button>
                    </Stack>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="event_date"
                      name="event_date"
                      label="Datum događaja"
                      type="datetime-local"
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="brand"
                      name="brand"
                      label="Brend"
                      placeholder="Npr. Apple, Nike, Samsung..."
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: itemType === "lost" ? 6 : 12 }}>
                    <TextField
                      id="color"
                      name="color"
                      label="Boja"
                      placeholder="Npr. crna, plava, crvena..."
                      fullWidth
                    />
                  </Grid>

                  {itemType === "lost" && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        id="reward_amount"
                        name="reward_amount"
                        label="Nagrada (KM)"
                        type="number"
                        slotProps={{
                          htmlInput: { step: "0.01", min: "0" },
                        }}
                        placeholder="Npr. 50"
                        fullWidth
                      />
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ my: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", fontSize: "0.75rem" }}>
                    Slike predmeta
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Button
                      component="label"
                      variant="contained"
                      color="primary"
                    >
                      Odaberi slike
                      <input
                        id="images"
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleImagesChange}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Možeš odabrati više slika odjednom.
                    </Typography>
                  </Stack>

                  {imagePreviews.length > 0 && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {imagePreviews.map((preview, index) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`${images[index].name}-${index}`}>
                          <Card sx={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", border: "1px solid", borderColor: "grey.200" }}>
                            <Image
                              src={preview}
                              alt={`Pregled slike ${index + 1}`}
                              fill
                              style={{ objectFit: "cover" }}
                              unoptimized
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeImage(index)}
                              aria-label={`Ukloni sliku ${index + 1}`}
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                bgcolor: "rgba(28, 25, 23, 0.85)",
                                color: "#ffffff",
                                "&:hover": {
                                  bgcolor: "error.main",
                                },
                              }}
                            >
                              <FontAwesomeIcon icon={faXmark} size="xs" />
                            </IconButton>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="contact_phone"
                      name="contact_phone"
                      label="Kontakt telefon"
                      type="tel"
                      placeholder="+387 61 123 456"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="contact_email"
                      name="contact_email"
                      label="Kontakt email"
                      type="email"
                      placeholder="ime@email.com"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <TextField
                  id="description"
                  name="description"
                  label="Opis predmeta"
                  placeholder="Unesi dodatne detalje o predmetu..."
                  multiline
                  rows={5}
                  required
                  fullWidth
                />

                <TextField
                  id="hidden_unique_features"
                  name="hidden_unique_features"
                  label="Skriveni unikatni detalji"
                  placeholder="Detalji koje samo vlasnik zna, npr. ogrebotina, naljepnica ili sadržaj novčanika..."
                  multiline
                  rows={3}
                  fullWidth
                />

                {itemType === "found" && (
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={verificationEnabled}
                          onChange={(event) => setVerificationEnabled(event.target.checked)}
                          color="primary"
                        />
                      }
                      label="Uključi verifikaciona pitanja"
                    />

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                      Ako uključiš ovu opciju, korisnik mora odgovoriti na pitanja prije nego što započne chat.
                    </Typography>

                    {verificationEnabled && (
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        {verificationQuestions.map((question, index) => (
                          <Stack key={index} direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                            <TextField
                              value={question}
                              onChange={(event) =>
                                updateVerificationQuestion(index, event.target.value)
                              }
                              label={`Pitanje ${index + 1}`}
                              placeholder={`Npr. Koje je boje predmet?`}
                              multiline
                              rows={2}
                              fullWidth
                            />

                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => removeVerificationQuestion(index)}
                              disabled={verificationQuestions.length === 1}
                              sx={{ minHeight: 56, py: 1 }}
                            >
                              Ukloni
                            </Button>
                          </Stack>
                        ))}

                        <Button
                          variant="outlined"
                          onClick={addVerificationQuestion}
                          sx={{ alignSelf: "flex-start" }}
                        >
                          + Dodaj pitanje
                        </Button>
                      </Stack>
                    )}
                  </Box>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "grey.200" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ px: 4, py: 1.2 }}
                  >
                    {isSubmitting ? "Dodavanje..." : "Dodaj predmet"}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    sx={{ px: 4, py: 1.2 }}
                  >
                    Očisti formu
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

export default function AddItemPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size={24} />
          <Typography variant="body1">Učitavanje forme...</Typography>
        </Stack>
      </Container>
    }>
      <AddItemPageContent />
    </Suspense>
  );
}
