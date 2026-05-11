import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types/listing";
import { StatusBadge } from "@/components/common/StatusBadge";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="listing-card">
      {listing.image ? (
        <Image
          src={listing.image}
          alt={listing.title}
          width={80}
          height={80}
          className="listing-card__image"
        />
      ) : (
        <div className="listing-card__image listing-card__image--placeholder" />
      )}
      <div className="listing-card__content">
        <div className="listing-card__header">
          <h3 className="listing-card__title">{listing.title}</h3>
          <StatusBadge status={listing.status} />
        </div>
        <p className="listing-card__description">{listing.description}</p>
        <div className="listing-card__meta">
          <span>{listing.category}</span>
          <span>{listing.location}</span>
          <span>{listing.date}</span>
          {listing.hasPotentialMatch ? (
            <span className="listing-card__match">
              <span className="listing-card__match-dot" />
              Mogući match
            </span>
          ) : null}
        </div>
        <Link href={`/listings/${listing.id}`} className="listing-card__link">
          Pogledaj detalje
        </Link>
      </div>
    </article>
  );
}
