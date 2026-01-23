'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch';
import { RestaurantCard } from './RestaurantCard';
import { Spinner } from '@/components/ui/Spinner';
import type { PlaceSearchParams } from '@/types/restaurant';

interface RestaurantSearchProps {
  onSelectRestaurant?: (placeId: string) => void;
}

export function RestaurantSearch({ onSelectRestaurant }: RestaurantSearchProps) {
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useState<PlaceSearchParams | null>(null);

  const { data, isLoading, error } = useRestaurantSearch(searchParams);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      // Get user location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setSearchParams({
              query: query.trim(),
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              radius: 10000, // 10km
            });
          },
          () => {
            // Location denied, search without location
            setSearchParams({ query: query.trim() });
          }
        );
      } else {
        setSearchParams({ query: query.trim() });
      }
    },
    [query]
  );

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants..."
          className="flex-1"
        />
        <Button type="submit" isLoading={isLoading}>
          Search
        </Button>
      </form>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-600">
          Failed to search. Please try again.
        </div>
      )}

      {data?.restaurants && data.restaurants.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Found {data.restaurants.length} restaurants
          </p>
          {data.restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.place_id}
              restaurant={restaurant}
              onClick={() => onSelectRestaurant?.(restaurant.place_id)}
            />
          ))}
        </div>
      )}

      {data?.restaurants && data.restaurants.length === 0 && searchParams && (
        <div className="text-center py-8 text-gray-500">
          No restaurants found. Try a different search term.
        </div>
      )}
    </div>
  );
}
