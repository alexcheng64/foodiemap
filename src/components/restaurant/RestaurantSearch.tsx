'use client';

import { useCallback, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch';
import { RestaurantCard } from './RestaurantCard';
import { Spinner } from '@/components/ui/Spinner';
import { useSearchContext, SortOption } from '@/components/providers/SearchProvider';

const CUISINE_TYPES = [
  { value: '', label: 'All Cuisines' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'thai', label: 'Thai' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'indian', label: 'Indian' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'american', label: 'American' },
  { value: 'french', label: 'French' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'middle eastern', label: 'Middle Eastern' },
  { value: 'greek', label: 'Greek' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'steakhouse', label: 'Steakhouse' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'sushi', label: 'Sushi' },
  { value: 'ramen', label: 'Ramen' },
  { value: 'burger', label: 'Burger' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'dessert', label: 'Dessert' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any Rating' },
  { value: 3, label: '3+ Stars' },
  { value: 3.5, label: '3.5+ Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 4.5, label: '4.5+ Stars' },
];

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface RestaurantSearchProps {
  onSelectRestaurant?: (placeId: string) => void;
}

export function RestaurantSearch({ onSelectRestaurant }: RestaurantSearchProps) {
  const { query, setQuery, searchParams, setSearchParams, sortBy, setSortBy, clearSearch } = useSearchContext();
  const [cuisine, setCuisine] = useState('');
  const [minRating, setMinRating] = useState(0);

  const { data, isLoading, error } = useRestaurantSearch(searchParams);

  const sortedRestaurants = useMemo(() => {
    if (!data?.restaurants) return [];

    // Filter by minimum rating
    let restaurants = [...data.restaurants];
    if (minRating > 0) {
      restaurants = restaurants.filter((r) => (r.rating ?? 0) >= minRating);
    }

    const userLocation = searchParams?.location;

    // Sort
    switch (sortBy) {
      case 'distance':
        if (userLocation) {
          return restaurants.sort((a, b) => {
            const distA = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              a.geometry.location.lat,
              a.geometry.location.lng
            );
            const distB = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              b.geometry.location.lat,
              b.geometry.location.lng
            );
            return distA - distB;
          });
        }
        return restaurants;
      case 'name':
        return restaurants.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return restaurants.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return restaurants;
    }
  }, [data?.restaurants, sortBy, searchParams?.location, minRating]);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      // Build search query - combine text query with cuisine
      const searchQuery = cuisine
        ? query.trim()
          ? `${cuisine} ${query.trim()}`
          : `${cuisine} restaurant`
        : query.trim();

      if (!searchQuery) return;

      // Get user location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setSearchParams({
              query: searchQuery,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              radius: 10000, // 10km
            });
          },
          () => {
            // Location denied, search without location
            setSearchParams({ query: searchQuery });
          }
        );
      } else {
        setSearchParams({ query: searchQuery });
      }
    },
    [query, cuisine, setSearchParams]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cuisine-select" className="block text-sm font-medium text-gray-700 mb-1">
            Cuisine
          </label>
          <select
            id="cuisine-select"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {CUISINE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Rating
          </label>
          <select
            id="rating-filter"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants or leave empty to search by cuisine..."
            className="w-full pr-8"
          />
          {(query || searchParams) && (
            <button
              type="button"
              onClick={() => {
                clearSearch();
                setCuisine('');
                setMinRating(0);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
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

      {sortedRestaurants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {sortedRestaurants.length} restaurants
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-gray-600">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="distance">Distance</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
          {sortedRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.place_id}
              restaurant={restaurant}
              onClick={() => onSelectRestaurant?.(restaurant.place_id)}
            />
          ))}
        </div>
      )}

      {sortedRestaurants.length === 0 && searchParams && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No restaurants found. Try a different search term.
        </div>
      )}
    </div>
  );
}
