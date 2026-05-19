export type ListingStatus = "active" | "resolved" | "expired";

export type ListingType = "lost" | "found";

export type Listing = {
  id: number;
  user_id: number;

  title: string;
  description: string;

  item_type: ListingType;
  category: string;

  location_name: string;
  latitude: number | null;
  longitude: number | null;

  event_date: string;
  image_url: string | null;

  brand: string | null;
  color: string | null;

  reward_amount: number | null;

  contact_phone: string | null;
  contact_email: string | null;

  status: ListingStatus;

  created_at: string;
  updated_at: string;
};
