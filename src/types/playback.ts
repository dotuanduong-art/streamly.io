export type PlaybackSourceType =
  | 'MP4'
  | 'HLS'
  | 'DASH'
  | 'WEBM';

export interface PlaybackSource {
  id: number;
  movieId: number;
  sourceUrl: string;
  sourceType: PlaybackSourceType;
  quality?: string | null;
  language?: string | null;
  providerName?: string | null;
  license?: string | null;
  attributionUrl?: string | null;
  subtitleUrl?: string | null;
  subtitleLanguage?: string | null;
  subtitleLabel?: string | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaybackSourceRequest {
  sourceUrl: string;
  sourceType: PlaybackSourceType;
  quality?: string | null;
  language?: string | null;
  providerName?: string | null;
  license?: string | null;
  attributionUrl?: string | null;
  subtitleUrl?: string | null;
  subtitleLanguage?: string | null;
  subtitleLabel?: string | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export type UpdatePlaybackSourceRequest =
  CreatePlaybackSourceRequest;