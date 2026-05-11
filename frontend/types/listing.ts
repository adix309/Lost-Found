export type ListingStatus = "lost" | "found" | "resolved";

export type ListingType = "lost" | "found";

export type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ListingStatus;
  location: string;
  date: string;
  image: string | null;
  hasPotentialMatch: boolean;
  type: ListingType;
};
