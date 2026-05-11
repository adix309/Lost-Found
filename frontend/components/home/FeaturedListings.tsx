"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ListingCard } from "@/components/listings/ListingCard";
import { homepageListings } from "@/data/homepageListings";
import type { ListingType } from "@/types/listing";

const tabs: { label: string; value: ListingType }[] = [
  { label: "Najnovije izgubljeno", value: "lost" },
  { label: "Najnovije pronađeno", value: "found" },
];

export function FeaturedListings() {
  const [activeTab, setActiveTab] = useState<ListingType>("lost");

  const listings = useMemo(() => {
    return homepageListings
      .filter((listing) => listing.type === activeTab)
      .slice(0, 6);
  }, [activeTab]);

  return (
    <section className="featured">
      <Container className="featured__inner">
        <SectionHeading
          title="Izdvojeni oglasi"
          description="Najnovije prijave iz zajednice, sa jasnim statusima i lokacijama."
        />
        <div className="featured__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`tab ${activeTab === tab.value ? "tab--active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="featured__grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  );
}
