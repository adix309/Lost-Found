import type { User } from "@/types/user";
import type { Listing } from "@/types/listing";

export type ClaimStatus =
  | "pending"
  | "under_verification"
  | "approved"
  | "accepted" // keeping for backward compatibility
  | "handoff_pending"
  | "completed"
  | "rejected"
  | "cancelled";

export type ClaimVerificationAnswer = {
  question_id: number;
  question_text: string;
  answer: string;
};

export type Claim = {
  id: number;
  item_id: number;
  user_id: number;
  lost_item_id?: number | null;
  message: string;
  proof_description?: string | null;
  status: ClaimStatus;
  claimer_confirmed_handoff: boolean;
  owner_confirmed_handoff: boolean;
  verification_answers?: ClaimVerificationAnswer[] | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: User | null;
  item?: Listing | null;
};
