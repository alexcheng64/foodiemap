import type { Bookmark, Tag } from './database';

export type VisitStatus = 'none' | 'want_to_visit' | 'visited';

export interface BookmarkFilters {
  visitStatus?: VisitStatus | 'all';
  tagIds?: string[];
  search?: string;
}

export interface BookmarkWithTags extends Bookmark {
  tags: Tag[];
}

export interface CreateBookmarkInput {
  google_place_id: string;
  restaurant_name: string;
  address: string;
  latitude: number;
  longitude: number;
  google_rating?: number | null;
  google_rating_count?: number | null;
  price_level?: number | null;
  phone?: string | null;
  website?: string | null;
  photo_reference?: string | null;
  personal_note?: string | null;
  visit_status?: VisitStatus;
}

export interface UpdateBookmarkInput {
  personal_note?: string | null;
  personal_rating?: number | null;
  visit_status?: VisitStatus;
  visited_at?: string | null;
}
