export type UserLevel = 'observer' | 'guide' | 'critic';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  website?: string;
  tella_balance: number;
  ink_balance: number;
  level: UserLevel;
  // Computed fields
  follower_count?: number;
  following_count?: number;
  poem_count?: number;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  color: string;
  created_at: string;
  // Computed
  poem_count?: number;
  poet_count?: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Poem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  topic_id?: string;
  published: boolean;
  revision_count: number;
  ink_spent: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  author?: UserProfile;
  topic?: Topic;
  tags?: Tag[];
  // Counts
  like_count?: number;
  feedback_count?: number;
  boost_count?: number;
  // User state
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_pushed?: boolean;
  // Feed label
  feed_label?: FeedLabel;
}

export type FeedLabel = 'picks' | 'latest' | 'discussed' | 'hearted' | 'undiscovered';

export interface PoemDraft {
  id: string;
  poem_id: string;
  content: string;
  draft_number: number;
  poet_note?: string;
  changes_summary: string[];
  created_at: string;
  // Joined
  feedback_received?: Feedback[];
  inspired_by?: UserProfile[];
}

export interface Feedback {
  id: string;
  poem_id: string;
  user_id: string;
  content: string;
  is_highlighted: boolean;
  created_at: string;
  // Joined
  author?: UserProfile;
  helpful_count?: number;
  is_helpful?: boolean;
}

export interface CriticNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined
  author?: UserProfile;
  like_count?: number;
  is_liked?: boolean;
}

export interface ReadingList {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  // Joined
  owner?: UserProfile;
  poem_count?: number;
  poems?: Poem[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  content: string;
  read: boolean;
  related_id?: string;
  actor_id?: string;
  created_at: string;
  // Joined
  actor?: UserProfile;
}

export type NotificationType =
  | 'feedback_received'
  | 'poem_liked'
  | 'poem_revised'
  | 'feedback_credited'
  | 'feedback_highlighted'
  | 'followed'
  | 'poem_boosted'
  | 'level_up';

export interface TellaTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  related_id?: string;
  created_at: string;
}

export interface InkTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  related_id?: string;
  created_at: string;
}

export type FeedTab = 'picks' | 'latest' | 'discussed' | 'hearted' | 'undiscovered' | 'following';
