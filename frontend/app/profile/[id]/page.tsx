import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Listing } from "@/types/listing";
import styles from "@/components/profile/ProfileStyles.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

type PublicUser = {
  id: number;
  username: string;
  email?: string | null;
  profile_image?: string | null;
  created_at?: string | null;
};

type UserItem = Listing & {
  id: number;
  title: string;
  description: string;
  item_type: "lost" | "found";
  category: string;
  location_name: string;
  image_url?: string | null;
  status: "active" | "resolved" | "expired";
  created_at: string;
};

function getImageSrc(imageUrl?: string | null) {
  if (!imageUrl) {
    return "/no-image.jpg";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Nije navedeno";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTypeLabel(type: "lost" | "found") {
  return type === "lost" ? "Izgubljeno" : "Pronađeno";
}

async function getPublicUser(id: string) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju korisnika.");
  }

  const user: PublicUser = await response.json();
  return user;
}

async function getUserItems(id: string) {
  const response = await fetch(`${API_URL}/items?user_id=${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const items: UserItem[] = await response.json();
  return items;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  const [user, items] = await Promise.all([
    getPublicUser(id),
    getUserItems(id),
  ]);

  const activeItems = items.filter((item) => item.status === "active");

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <section className={styles["profile-page"]}>
          <div className="container">
            <div className={styles["profile-header"]}>
              <p className={styles["profile-header__eyebrow"]}>
                Javni profil
              </p>

              <h1 className={styles["profile-header__title"]}>
                {user.username}
              </h1>

              <p className={styles["profile-header__description"]}>
                Pregled javnih informacija korisnika i oglasa koje je objavio.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 0.8fr) minmax(0, 1.2fr)",
                gap: "24px",
                alignItems: "start",
              }}
            >
              <aside
                style={{
                  padding: "24px",
                  borderRadius: "24px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Image
                  src={getImageSrc(user.profile_image)}
                  alt={user.username}
                  width={110}
                  height={110}
                  unoptimized
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "999px",
                    objectFit: "cover",
                    background: "#e2e8f0",
                    border: "4px solid #f8fafc",
                    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
                  }}
                />

                <h2
                  style={{
                    margin: "18px 0 6px",
                    fontSize: "24px",
                    color: "#0f172a",
                  }}
                >
                  {user.username}
                </h2>

                {user.email && (
                  <p
                    style={{
                      margin: "0 0 14px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    {user.email}
                  </p>
                )}

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "18px",
                    color: "#334155",
                    fontSize: "14px",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>Broj aktivnih oglasa:</strong> {activeItems.length}
                  </p>

                  <p style={{ margin: 0 }}>
                    <strong>Ukupno oglasa:</strong> {items.length}
                  </p>

                  <p style={{ margin: 0 }}>
                    <strong>Član od:</strong> {formatDate(user.created_at)}
                  </p>
                </div>
              </aside>

              <section
                style={{
                  padding: "24px",
                  borderRadius: "24px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Objave korisnika
                    </p>

                    <h2
                      style={{
                        margin: 0,
                        color: "#0f172a",
                        fontSize: "22px",
                      }}
                    >
                      Predmeti koje je korisnik objavio
                    </h2>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div
                    style={{
                      padding: "22px",
                      borderRadius: "18px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#64748b",
                    }}
                  >
                    Ovaj korisnik još nema objavljenih predmeta.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/AllItems/${item.id}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          borderRadius: "18px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          textDecoration: "none",
                          color: "inherit",
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                      >
                        <Image
                          src={getImageSrc(item.image_url)}
                          alt={item.title}
                          width={420}
                          height={240}
                          unoptimized
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                            background: "#e2e8f0",
                          }}
                        />

                        <div
                          style={{
                            display: "grid",
                            gap: "8px",
                            padding: "14px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "999px",
                                background:
                                  item.item_type === "lost"
                                    ? "#fee2e2"
                                    : "#dcfce7",
                                color:
                                  item.item_type === "lost"
                                    ? "#991b1b"
                                    : "#166534",
                                fontSize: "11px",
                                fontWeight: 900,
                              }}
                            >
                              {getTypeLabel(item.item_type)}
                            </span>

                            <StatusBadge status={item.status} />
                          </div>

                          <h3
                            style={{
                              margin: 0,
                              color: "#0f172a",
                              fontSize: "16px",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.title}
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b",
                              fontSize: "13px",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.location_name}
                          </p>

                          <p
                            style={{
                              margin: 0,
                              color: "#475569",
                              fontSize: "13px",
                              lineHeight: 1.45,
                            }}
                          >
                            {item.description.length > 90
                              ? `${item.description.slice(0, 90)}...`
                              : item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}