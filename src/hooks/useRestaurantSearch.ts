'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Restaurant, RestaurantSearchResult, PlaceSearchParams } from '@/types/restaurant';

export function useRestaurantSearch(params: PlaceSearchParams | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['restaurant-search', params],
    queryFn: async (): Promise<RestaurantSearchResult> => {
      if (!params?.query) {
        return { restaurants: [] };
      }

      const { data, error } = await supabase.functions.invoke('google-places-search', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!params?.query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRestaurantDetails(placeId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['restaurant-details', placeId],
    queryFn: async (): Promise<Restaurant> => {
      const { data, error } = await supabase.functions.invoke('google-places-details', {
        body: { placeId },
      });

      if (error) throw error;
      return data.restaurant;
    },
    enabled: !!placeId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useBookmarkRestaurant() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          google_place_id: restaurant.place_id,
          restaurant_name: restaurant.name,
          address: restaurant.formatted_address,
          latitude: restaurant.geometry.location.lat,
          longitude: restaurant.geometry.location.lng,
          google_rating: restaurant.rating || null,
          google_rating_count: restaurant.user_ratings_total || null,
          price_level: restaurant.price_level || null,
          phone: restaurant.formatted_phone_number || null,
          website: restaurant.website || null,
          photo_reference: restaurant.photos?.[0]?.photo_reference || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Already bookmarked');
        }
        throw error;
      }
      return data;
    },
  });
}
