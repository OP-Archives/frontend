// VOD types
export interface VODNavigation {
  id: number;
  platform: string;
  platform_vod_id: string;
  title?: string;
  duration?: number;
  created_at?: string;
  thumbnail_url?: string | null;
  is_live?: boolean;
  chapters?: Chapter[];
  games?: GameEntry[];
  vod_uploads?: { thumbnail_url: string }[];
}

// --- List item (used in paginated lists) ---
export interface VodListItem {
  id: number;
  title: string;
  created_at: string;
  duration: number;
  platform?: string;
  is_live?: boolean;
  thumbnail_url?: string;
  chapters?: ChapterItem[];
  vod_uploads: VodUploadSimple[];
  games: GameItemSimple[];
}

// --- Detail view (full VOD with navigation, uploads, chapters, games) ---
export interface VodDetail {
  id: number;
  platform_vod_id: string;
  platform: string;
  title: string;
  duration: number;
  platform_stream_id: string;
  created_at: string;
  is_live: boolean;
  started_at: string;
  updated_at: string;
  thumbnail_url?: string | null;
  vod_uploads: VODUpload[];
  chapters: Chapter[];
  games: GameEntry[];
  prev?: VODNavigation[];
  next?: VODNavigation[];
}

export interface VODUpload {
  id: number;
  upload_id: string;
  type: 'live' | 'vod';
  duration: number | null;
  part: number | null;
  status: string;
  thumbnail_url: string;
  created_at: string;
}

export interface Chapter {
  name: string;
  image: string;
  start: number;
  duration: number;
  end: number;
}

export interface GameEntry {
  id: string;
  game_name: string;
  video_id: string;
  start: string;
  duration: number;
  chapter_image?: string;
  thumbnail_url?: string;
  title?: string;
  name?: string;
  game_id?: string;
  created_at?: string;
}

// Simplified types for list endpoints (xQc-site pattern)
export interface VodUploadSimple {
  thumbnail_url?: string;
}

export interface GameItemSimple {
  thumbnail_url?: string;
}

export interface ChapterItem {
  name: string;
  image: string;
  game_id?: string;
  start?: number;
  end?: number;
  duration?: number;
}

export interface GameData {
  id: string;
  vod_id: string;
  title: string;
  created_at: string;
  duration: number;
  thumbnail_url?: string;
  chapters?: ChapterItem[];
  game_name?: string;
  chapter_image?: string;
  game_id?: string;
}

export interface LibraryChapterItem {
  game_id: string;
  name: string;
  image?: string;
  count: number;
}

// Emotes types
export interface EmotesResponse {
  vodId: number;
  ffz_emotes: FfzEmote[];
  bttv_emotes: BttvEmote[];
  seventv_emotes: SevenTVEmote[];
}

export interface FfzEmote {
  id: number | string;
  code?: string;
  name?: string;
  text: string;
}

export interface BttvEmote {
  id: string;
  code: string;
}

export interface SevenTVEmote {
  id: string;
  code: string;
  name?: string;
  flags: number;
}

// Comments types
export interface CommentsResponse {
  comments: Comment[];
  cursor: string;
}

export interface Comment {
  id: string;
  vod_id: number;
  display_name: string;
  content_offset_seconds: number;
  user_color: string;
  created_at: string;
  message: MessageFragment[];
  user_badges: UserBadge[];
}

export interface MessageFragment {
  text: string;
  emote?: { id: string; from: number; emoteID: string } | null;
  emoticon?: { emoticon_id: string };
}

export interface UserBadge {
  _id?: string;
  setID: string;
  version: string;
}

export interface Badge {
  set_id: string;
  versions: BadgeVersion[];
}

export interface BadgeVersion {
  id: string;
  image_url_1x: string;
  image_url_2x: string;
  image_url_4x: string;
  title: string;
  description: string;
  click_action: string;
  click_url: string | null;
}

// Shared component types
export interface PartInfo {
  part: number;
  timestamp: number;
}

export type EmoteProvider = 'FFZ' | 'BTTV' | '7TV' | 'Twitch' | 'Kick';

export type PlayerState = -1 | 0 | 1 | 2 | 3 | 5;

export interface EmoteEntry {
  id: string | number;
  code: string;
  name?: string;
  provider: EmoteProvider;
  flags?: number;
}

export type PlayerSource = string | { src: string; type: string; objectUrl: string } | undefined;

export interface PlayerSettings {
  volume: number;
  muted: boolean;
}

// Tenant types
export interface TenantPlatform {
  name: string;
  enabled: boolean;
  id: string | null;
}

export interface TenantSocial {
  name: string;
  url: string;
}

export interface TenantCdn {
  enabled: boolean;
  baseUrl: string;
}

export interface Tenant {
  id: string;
  display_name: string;
  profile_image_url: string;
  background_image_url: string | null;
  created_at: string;
  status: string;
  platforms: TenantPlatform[];
  social_media: TenantSocial[];
  default_delay: number;
  cdn: TenantCdn;
  games: boolean;
  vods: boolean;
  banner_image_url: string | null;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface LibraryGameItem {
  game_id: string;
  game_name: string;
  chapter_image?: string;
  count: number;
  last_played?: string;
}
