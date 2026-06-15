"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import profileStyles from "@/components/profile/ProfileStyles.module.css";
import styles from "./AddItem.module.css";

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

type HiddenUniqueFeatures = Record<string, unknown> | null;

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

export default function AddItemPage() {
  const router = useRouter();

  const [initialType] = useState<ItemType>(() => {
    if (typeof window === "undefined") {
      return "lost";
    }

    return new URLSearchParams(window.location.search).get("type") === "found"
      ? "found"
      : "lost";
  });
  const [itemType, setItemType] = useState<ItemType>(initialType);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
    "Dokumenti",
  );
  const [customCategory, setCustomCategory] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(event.target.files || []));
    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  function resetForm() {
    formRef.current?.reset();
    setItemType(initialType);
    setCategory("Dokumenti");
    setCustomCategory("");
    setLatitude(null);
    setLongitude(null);
    setImages([]);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Moraš biti prijavljen da dodaš predmet.");
      setTimeout(() => router.push("/login"), 1200);
      return;
    }

    if (latitude === null || longitude === null) {
      setError("Klikni na mapu da označiš lokaciju predmeta.");
      return;
    }

    if (images.length === 0) {
      setError("Odaberi najmanje jednu sliku predmeta.");
      return;
    }

    const resolvedCategory =
      category === "Ostalo" ? customCategory.trim() : category;

    if (!resolvedCategory) {
      setError("Unesi drugu kategoriju predmeta.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const eventDate = formData.get("event_date");

    const itemData = {
      title: formData.get("title"),
      description: formData.get("description"),
      item_type: itemType,
      category: resolvedCategory,
      location_name: formData.get("location_name"),
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
      hidden_unique_features: parseHiddenUniqueFeatures(
        formData.get("hidden_unique_features"),
      ),
    };

    setIsSubmitting(true);

    try {
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

      setSuccess("Predmet i slike su uspješno dodani.");
      setTimeout(() => router.push(`/AllItems/${createdItem.id}`), 1200);
    } catch (submitError) {
      console.error("Greška pri dodavanju predmeta:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Greška prilikom dodavanja predmeta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <section className={profileStyles["profile-page"]}>
          <div className="container">
            <div ref={bannerRef}>
              {success && (
                <div
                  className={`${profileStyles["profile-message"]} ${profileStyles["profile-message--success"]}`}
                >
                  {success}
                </div>
              )}

              {error && (
                <div
                  className={`${profileStyles["profile-message"]} ${profileStyles["profile-message--error"]}`}
                >
                  {error}
                </div>
              )}
            </div>

            <div className={profileStyles["profile-header"]}>
              <p className={profileStyles["profile-header__eyebrow"]}>
                Novi predmet
              </p>
              <h1 className={profileStyles["profile-header__title"]}>
                Dodaj novi predmet
              </h1>
              <p className={profileStyles["profile-header__description"]}>
                Popuni podatke za izgubljeni ili pronađeni predmet.
              </p>
            </div>

            <section className={profileStyles["profile-panel"]}>
              <h2 className={profileStyles["profile-panel__title"]}>
                Informacije o predmetu
              </h2>

              <form
                ref={formRef}
                className={profileStyles["profile-form"]}
                onSubmit={handleSubmit}
              >
                <div className={profileStyles["profile-form__field"]}>
                  <span className="field-label">Tip oglasa*</span>
                  <div className={styles.typeCards}>
                    <label
                      className={`${styles.typeCard} ${
                        itemType === "lost" ? styles.typeCardSelected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="item_type"
                        value="lost"
                        checked={itemType === "lost"}
                        onChange={() => setItemType("lost")}
                        className={styles.typeRadio}
                      />
                      <span className={styles.typeTitle}>
                        Izgubio sam predmet
                      </span>
                      <span className={styles.typeDescription}>
                        Objavi predmet koji pokušavaš pronaći.
                      </span>
                    </label>

                    <label
                      className={`${styles.typeCard} ${
                        itemType === "found" ? styles.typeCardSelected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="item_type"
                        value="found"
                        checked={itemType === "found"}
                        onChange={() => setItemType("found")}
                        className={styles.typeRadio}
                      />
                      <span className={styles.typeTitle}>
                        Pronašao sam predmet
                      </span>
                      <span className={styles.typeDescription}>
                        Objavi predmet i pomozi vlasniku da ga pronađe.
                      </span>
                    </label>
                  </div>
                </div>

                <div className={profileStyles["profile-form__row"]}>
                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="title" className="field-label">
                      Naziv predmeta*
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="form-input"
                      placeholder="Npr. novčanik, ključevi, telefon..."
                      required
                    />
                  </div>

                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="category" className="field-label">
                      Kategorija*
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="form-select"
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value as (typeof CATEGORIES)[number],
                        )
                      }
                      required
                    >
                      {CATEGORIES.map((categoryOption) => (
                        <option key={categoryOption} value={categoryOption}>
                          {categoryOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {category === "Ostalo" && (
                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="custom_category" className="field-label">
                      Druga kategorija*
                    </label>
                    <input
                      id="custom_category"
                      type="text"
                      className="form-input"
                      value={customCategory}
                      onChange={(event) => setCustomCategory(event.target.value)}
                      placeholder="Unesi kategoriju predmeta"
                      required
                    />
                  </div>
                )}

                <div className={styles.locationSection}>
                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="location_name" className="field-label">
                      Lokacija predmeta*
                    </label>
                    <input
                      id="location_name"
                      name="location_name"
                      type="text"
                      className="form-input"
                      placeholder="Npr. SCC Sarajevo"
                      required
                    />
                  </div>

                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationSelect={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                  />

                  <p className={styles.locationHint}>
                    Kliknite na mapu da označite lokaciju.
                  </p>
                  {latitude !== null && longitude !== null && (
                    <p className={styles.selectedLocation}>
                      Odabrana lokacija: {latitude.toFixed(4)},{" "}
                      {longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className={profileStyles["profile-form__row"]}>
                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="event_date" className="field-label">
                      Datum događaja*
                    </label>
                    <input
                      id="event_date"
                      name="event_date"
                      type="datetime-local"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="brand" className="field-label">
                      Brend
                    </label>
                    <input
                      id="brand"
                      name="brand"
                      type="text"
                      className="form-input"
                      placeholder="Npr. Apple, Nike, Samsung..."
                    />
                  </div>
                </div>

                <div className={profileStyles["profile-form__row"]}>
                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="color" className="field-label">
                      Boja
                    </label>
                    <input
                      id="color"
                      name="color"
                      type="text"
                      className="form-input"
                      placeholder="Npr. crna, plava, crvena..."
                    />
                  </div>

                  {itemType === "lost" && (
                    <div className={profileStyles["profile-form__field"]}>
                      <label htmlFor="reward_amount" className="field-label">
                        Nagrada
                      </label>
                      <input
                        id="reward_amount"
                        name="reward_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-input"
                        placeholder="Npr. 50"
                      />
                    </div>
                  )}
                </div>

                <div className={styles.imageField}>
                  <span className="field-label">Slike predmeta*</span>
                  <label className={styles.imageUploadButton}>
                    Odaberi slike
                    <input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className={styles.hiddenFileInput}
                      onChange={handleImagesChange}
                    />
                  </label>
                  <p className={styles.imageHint}>
                    Možeš odabrati više slika odjednom.
                  </p>

                  {imagePreviews.length > 0 && (
                    <div className={styles.previewGrid}>
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`${images[index].name}-${index}`}
                          className={styles.previewCard}
                        >
                          <Image
                            src={preview}
                            alt={`Pregled slike ${index + 1}`}
                            width={240}
                            height={240}
                            unoptimized
                            className={styles.previewImage}
                          />
                          <button
                            type="button"
                            className={styles.removeImage}
                            onClick={() => removeImage(index)}
                            aria-label={`Ukloni sliku ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={profileStyles["profile-form__row"]}>
                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="contact_phone" className="field-label">
                      Kontakt telefon
                    </label>
                    <input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      className="form-input"
                      placeholder="+387 61 123 456"
                    />
                  </div>

                  <div className={profileStyles["profile-form__field"]}>
                    <label htmlFor="contact_email" className="field-label">
                      Kontakt email
                    </label>
                    <input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      className="form-input"
                      placeholder="ime@email.com"
                    />
                  </div>
                </div>

                <div className={profileStyles["profile-form__field"]}>
                  <label htmlFor="description" className="field-label">
                    Opis predmeta*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-input"
                    placeholder="Unesi dodatne detalje o predmetu..."
                    rows={6}
                    required
                    style={{
                      height: "auto",
                      minHeight: "9rem",
                      paddingTop: "0.9rem",
                    }}
                  />
                </div>

                <div className={profileStyles["profile-form__field"]}>
                  <label
                    htmlFor="hidden_unique_features"
                    className="field-label"
                  >
                    Skriveni unikatni detalji
                  </label>
                  <textarea
                    id="hidden_unique_features"
                    name="hidden_unique_features"
                    className="form-input"
                    placeholder="Detalji koje samo vlasnik zna, npr. ogrebotina, naljepnica ili sadržaj novčanika..."
                    rows={4}
                    style={{
                      height: "auto",
                      minHeight: "7rem",
                      paddingTop: "0.9rem",
                    }}
                  />
                </div>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Dodavanje..." : "Dodaj predmet"}
                  </button>

                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Očisti formu
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
