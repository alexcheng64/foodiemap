export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          google_place_id: string;
          restaurant_name: string;
          address: string;
          latitude: number;
          longitude: number;
          google_rating: number | null;
          google_rating_count: number | null;
          price_level: number | null;
          phone: string | null;
          website: string | null;
          photo_reference: string | null;
          personal_note: string | null;
          personal_rating: number | null;
          visit_status: 'none' | 'want_to_visit' | 'visited';
          visited_at: string | null;
          synced_to_google: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
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
          personal_rating?: number | null;
          visit_status?: 'want_to_visit' | 'visited';
          visited_at?: string | null;
          synced_to_google?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          google_place_id?: string;
          restaurant_name?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          google_rating?: number | null;
          google_rating_count?: number | null;
          price_level?: number | null;
          phone?: string | null;
          website?: string | null;
          photo_reference?: string | null;
          personal_note?: string | null;
          personal_rating?: number | null;
          visit_status?: 'want_to_visit' | 'visited';
          visited_at?: string | null;
          synced_to_google?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      bookmark_tags: {
        Row: {
          bookmark_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          bookmark_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          bookmark_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      google_maps_sync: {
        Row: {
          id: string;
          user_id: string;
          google_list_id: string | null;
          google_list_name: string | null;
          sync_direction: 'two_way' | 'to_google' | 'from_google';
          last_synced_at: string | null;
          sync_status: 'idle' | 'syncing' | 'error';
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          google_list_id?: string | null;
          google_list_name?: string | null;
          sync_direction?: 'two_way' | 'to_google' | 'from_google';
          last_synced_at?: string | null;
          sync_status?: 'idle' | 'syncing' | 'error';
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          google_list_id?: string | null;
          google_list_name?: string | null;
          sync_direction?: 'two_way' | 'to_google' | 'from_google';
          last_synced_at?: string | null;
          sync_status?: 'idle' | 'syncing' | 'error';
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      places_cache: {
        Row: {
          place_id: string;
          data: Json;
          cached_at: string;
          expires_at: string;
        };
        Insert: {
          place_id: string;
          data: Json;
          cached_at?: string;
          expires_at?: string;
        };
        Update: {
          place_id?: string;
          data?: Json;
          cached_at?: string;
          expires_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_cached_place: {
        Args: {
          p_place_id: string;
        };
        Returns: Json;
      };
      cache_place: {
        Args: {
          p_place_id: string;
          p_data: Json;
          p_ttl_hours?: number;
        };
        Returns: void;
      };
      cleanup_expired_cache: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      visit_status: 'none' | 'want_to_visit' | 'visited';
      sync_direction: 'two_way' | 'to_google' | 'from_google';
      sync_status: 'idle' | 'syncing' | 'error';
    };
  };
};

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Convenience types
export type Profile = Tables<'profiles'>;
export type Bookmark = Tables<'bookmarks'>;
export type Tag = Tables<'tags'>;
export type BookmarkTag = Tables<'bookmark_tags'>;
export type GoogleMapsSync = Tables<'google_maps_sync'>;

// Extended types with relations
export type BookmarkWithTags = Bookmark & {
  tags: Tag[];
};
