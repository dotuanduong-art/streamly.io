export interface PlaybackSource {
  id: number;
  movieId: number;
  sourceUrl: string;
  sourceType: 'MP4' | 'HLS' | 'DASH' | 'WEBM';
  quality?: string | null;
  language?: string | null;
  providerName?: string | null;
  license?: string | null;
  attributionUrl?: string | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}