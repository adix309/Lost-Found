export type NotificationType =
  | "potential_match"
  | "conversation_started"
  | "item_resolved"
  | "item_removed_by_admin"
  | "item_expiring_soon"
  | "system_notification";

export interface NotificationData {
  match_id?: number;
  source_item_id?: number;
  candidate_item_id?: number;
  score?: number;
  rank?: number;
  candidate_item_type?: string;
  match_reason?: {
    reasons?: string[];
    common_words?: string[];
  };
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