import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Listing } from "@/types/listing";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Nije navedeno";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const date = parsed.toLocaleDateString("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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

export default async function ItemDetailsPage({ params }: Props) {
  const { id } = await params;

  const response = await fetch(`${API_URL}/items/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju detalja itema.");
  }

  const item: ListingDetails = await response.json();

  const typeLabel = item.item_type === "lost" ? "Izgubljeno" : "Pronađeno";
  const owner = getOwner(item);

  const imageSrc = getImageSrc(item.image_url);
  const imageAlt = item.image_url ? item.title : "Slika nije dodana";

  const ownerDisplayName =
    owner?.full_name || owner?.username || owner?.email || "Nepoznat korisnik";

  const ownerImageSrc = getImageSrc(owner?.profile_image);

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main all-items-page">
        <section className="all-items-page__hero">
          <span>{typeLabel}</span>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.7fr)",
            gap: "28px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
            }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={900}
              height={520}
              unoptimized
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>

          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderRadius: "22px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <StatusBadge status={item.status} />
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  color: "#334155",
                  fontSize: "15px",
                  lineHeight: 1.5,
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Kategorija:</strong> {item.category}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Lokacija:</strong> {item.location_name}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Datum događaja:</strong>{" "}
                  {formatDateTime(item.event_date)}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Boja:</strong> {item.color || "Nije navedeno"}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Brand:</strong> {item.brand || "Nije navedeno"}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Nagrada:</strong>{" "}
                  {item.reward_amount !== null &&
                  item.reward_amount !== undefined
                    ? `${item.reward_amount} KM`
                    : "Nije navedeno"}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Telefon:</strong>{" "}
                  {item.contact_phone || "Nije navedeno"}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Email:</strong>{" "}
                  {item.contact_email || "Nije navedeno"}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Objavljeno:</strong>{" "}
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "22px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 14px",
                  fontSize: "18px",
                  color: "#0f172a",
                }}
              >
                Objavio korisnik
              </h2>

              {owner ? (
                <Link
                  href={`/profile/${owner.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px",
                    borderRadius: "16px",
                    background: "#f8fafc",
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Image
                    src={ownerImageSrc}
                    alt={ownerDisplayName}
                    width={52}
                    height={52}
                    unoptimized
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "999px",
                      objectFit: "cover",
                      background: "#e2e8f0",
                    }}
                  />

                  <div>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {ownerDisplayName}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      Pogledaj profil korisnika
                    </p>
                  </div>
                </Link>
              ) : item.user_id ? (
                <Link
                  href={`/profile/${item.user_id}`}
                  style={{
                    display: "inline-flex",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Pogledaj profil korisnika
                </Link>
              ) : (
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    lineHeight: 1.5,
                  }}
                >
                  Podaci o korisniku nisu dostupni.
                </p>
              )}
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}