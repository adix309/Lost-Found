import Image from "next/image";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Listing } from "@/types/listing";

const API_URL = "http://localhost:8000";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function formatDateTime(value: string) {
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

  const item: Listing = await response.json();

  const typeLabel = item.item_type === "lost" ? "Izgubljeno" : "Pronađeno";

  const imageSrc = item.image_url
    ? `${API_URL}${item.image_url}`
    : "/no-image.jpg";

  const imageAlt = item.image_url ? item.title : "Slika nije dodana";

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main all-items-page">
        <section className="all-items-page__hero">
          <span>{typeLabel}</span>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
        </section>

        <section>
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={900}
            height={500}
            unoptimized
          />

          <div>
            <StatusBadge status={item.status} />

            <p>
              <strong>Kategorija:</strong> {item.category}
            </p>

            <p>
              <strong>Lokacija:</strong> {item.location_name}
            </p>

            <p>
              <strong>Datum događaja:</strong>{" "}
              {formatDateTime(item.event_date)}
            </p>

            <p>
              <strong>Boja:</strong> {item.color || "Nije navedeno"}
            </p>

            <p>
              <strong>Brand:</strong> {item.brand || "Nije navedeno"}
            </p>

            <p>
              <strong>Nagrada:</strong>{" "}
              {item.reward_amount !== null
                ? `${item.reward_amount} KM`
                : "Nije navedeno"}
            </p>

            <p>
              <strong>Telefon:</strong>{" "}
              {item.contact_phone || "Nije navedeno"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {item.contact_email || "Nije navedeno"}
            </p>

            <p>
              <strong>Objavljeno:</strong>{" "}
              {formatDateTime(item.created_at)}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}