import { notFound } from "next/navigation";
import type { Listing } from "@/types/listing";
import { ItemDetailsClient } from "@/components/listings/ItemDetailsClient";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    ai_checked?: string;
    similarity?: string;
    description_score?: string;
    rank?: string;
    rank_improved?: string;
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

async function getListingDetails(id: string): Promise<ListingDetails> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju detalja itema.");
  }

  return response.json();
}

export default async function ItemDetailsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sParams = (await searchParams) || {};
  
  const aiChecked = sParams.ai_checked === "true";
  const hasAiParam = sParams.ai_checked !== undefined;
  const similarityVal = sParams.similarity ? parseFloat(sParams.similarity) : null;
  const rankImproved = sParams.rank_improved === "true";

  const item = await getListingDetails(id);

  return (
    <ItemDetailsClient
      item={item}
      aiChecked={aiChecked}
      hasAiParam={hasAiParam}
      similarityVal={similarityVal}
      rankImproved={rankImproved}
    />
  );
}