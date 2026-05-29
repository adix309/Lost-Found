import type { User } from "@/types/user";
import type { Listing } from "@/types/listing";

export type Claim = {
  id: number;
  item_id: number;
  user_id: number;
  message: string;
  proof_description?: string | null;
  status: ClaimStatus;
  created_at: string;
  updated_at: string;
  user?: User | null;
  item?: Listing | null;
};

export type ClaimStatus = "pending" | "accepted" | "rejected";
