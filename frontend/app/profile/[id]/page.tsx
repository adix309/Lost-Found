import { notFound } from "next/navigation";
import { PublicProfileClient } from "@/components/profile/PublicProfileClient";
import type { Listing } from "@/types/listing";

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

async function getPublicUser(id: string): Promise<PublicUser> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju korisnika.");
  }

  return response.json();
}

async function getUserItems(id: string): Promise<UserItem[]> {
  const response = await fetch(`${API_URL}/items?user_id=${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  const [user, items] = await Promise.all([
    getPublicUser(id),
    getUserItems(id),
  ]);

  return (
    <PublicProfileClient user={user} items={items} />
  );
}