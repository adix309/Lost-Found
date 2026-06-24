export type NotificationType =
  | "potential_match"
  | "conversation_started"
  | "item_resolved"
  | "item_removed_by_admin"
  | "item_expiring_soon"
  | "system_notification";

export interface NotificationMatchReason {
  reasons?: string[];
  common_words?: string[];
}

export interface NotificationMatchPreview {
  match_id: number;
  item_id: number;
  title: string;
  category?: string | null;
  location_name?: string | null;
  event_date?: string | null;
  score: number;
  reasons?: string[];
  description?: string | null;
  image_url?: string | null;
  descriptionScore?: number;
  description_score?: number;
  imageSimilarityScore?: number | null;
  image_similarity_score?: number | null;
  finalScore?: number;
  final_score?: number;
  usedAiImageMatching?: boolean;
  used_image_reranking?: boolean;
  rank?: number;
  rank_improved?: boolean;
  rankImproved?: boolean;
}

export interface NotificationData {
  match_id?: number;
  source_item_id?: number;
  source_item_title?: string;
  candidate_item_id?: number;
  score?: number;
  best_score?: number;
  rank?: number;
  candidate_item_type?: string;
  match_reason?: NotificationMatchReason;
  matches?: NotificationMatchPreview[];
  [key: string]: unknown;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  data?: NotificationData | null;
}

export interface NotificationListResponse {
  items: NotificationItem[];
}