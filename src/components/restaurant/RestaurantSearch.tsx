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

const LOCATION_OPTIONS = [
  { value: 'vancouver', label: 'Vancouver', location: { lat: 49.2827, lng: -123.1207 } },
  { value: 'tokyo', label: 'Tokyo', location: { lat: 35.6762, lng: 139.6503 } },
  { value: 'hongkong', label: 'Hong Kong', location: { lat: 22.3193, lng: 114.1694 } },
];

const DISTRICT_OPTIONS: Record<string, { value: string; label: string; location: { lat: number; lng: number } }[]> = {
  vancouver: [
    { value: 'downtown', label: 'Downtown', location: { lat: 49.2827, lng: -123.1207 } },
    { value: 'kitsilano', label: 'Kitsilano', location: { lat: 49.2684, lng: -123.1681 } },
    { value: 'gastown', label: 'Gastown', location: { lat: 49.2846, lng: -123.1088 } },
    { value: 'chinatown', label: 'Chinatown', location: { lat: 49.2797, lng: -123.1002 } },
    { value: 'richmond', label: 'Richmond', location: { lat: 49.1666, lng: -123.1336 } },
    { value: 'burnaby', label: 'Burnaby', location: { lat: 49.2488, lng: -122.9805 } },
    { value: 'west-end', label: 'West End', location: { lat: 49.2869, lng: -123.1316 } },
    { value: 'commercial-drive', label: 'Commercial Drive', location: { lat: 49.2685, lng: -123.0694 } },
    { value: 'main-street', label: 'Main Street', location: { lat: 49.2673, lng: -123.1008 } },
    { value: 'yaletown', label: 'Yaletown', location: { lat: 49.2741, lng: -123.1212 } },
  ],
  tokyo: [
    { value: 'shibuya', label: 'Shibuya', location: { lat: 35.6580, lng: 139.7016 } },
    { value: 'shinjuku', label: 'Shinjuku', location: { lat: 35.6938, lng: 139.7034 } },
    { value: 'ginza', label: 'Ginza', location: { lat: 35.6722, lng: 139.7649 } },
    { value: 'roppongi', label: 'Roppongi', location: { lat: 35.6627, lng: 139.7307 } },
    { value: 'akihabara', label: 'Akihabara', location: { lat: 35.7023, lng: 139.7745 } },
    { value: 'ikebukuro', label: 'Ikebukuro', location: { lat: 35.7295, lng: 139.7109 } },
    { value: 'asakusa', label: 'Asakusa', location: { lat: 35.7148, lng: 139.7967 } },
    { value: 'harajuku', label: 'Harajuku', location: { lat: 35.6702, lng: 139.7027 } },
    { value: 'ueno', label: 'Ueno', location: { lat: 35.7089, lng: 139.7741 } },
    { value: 'ebisu', label: 'Ebisu', location: { lat: 35.6468, lng: 139.7100 } },
  ],
  hongkong: [
    { value: 'central', label: 'Central', location: { lat: 22.2816, lng: 114.1585 } },
    { value: 'wan-chai', label: 'Wan Chai', location: { lat: 22.2783, lng: 114.1747 } },
    { value: 'tsim-sha-tsui', label: 'Tsim Sha Tsui', location: { lat: 22.2988, lng: 114.1722 } },
    { value: 'mong-kok', label: 'Mong Kok', location: { lat: 22.3193, lng: 114.1694 } },
    { value: 'causeway-bay', label: 'Causeway Bay', location: { lat: 22.2801, lng: 114.1840 } },
    { value: 'sham-shui-po', label: 'Sham Shui Po', location: { lat: 22.3303, lng: 114.1588 } },
    { value: 'kennedy-town', label: 'Kennedy Town', location: { lat: 22.2819, lng: 114.1284 } },
    { value: 'sheung-wan', label: 'Sheung Wan', location: { lat: 22.2868, lng: 114.1502 } },
    { value: 'lan-kwai-fong', label: 'Lan Kwai Fong', location: { lat: 22.2809, lng: 114.1557 } },
    { value: 'aberdeen', label: 'Aberdeen', location: { lat: 22.2480, lng: 114.1550 } },
  ],
};

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

const RESULTS_PER_PAGE = 5;

export function RestaurantSearch({ onSelectRestaurant }: RestaurantSearchProps) {
  const { query, setQuery, searchParams, setSearchParams, sortBy, setSortBy, clearSearch } = useSearchContext();
  const [country, setCountry] = useState('');
  const [district, setDistrict] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset page when filters change
  const totalPages = Math.ceil(sortedRestaurants.length / RESULTS_PER_PAGE);
  const paginatedRestaurants = sortedRestaurants.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  // Reset to page 1 when results change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchParams, minRating, sortBy]);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!country || !district) return;

      const selectedDistrict = DISTRICT_OPTIONS[country]?.find((d) => d.value === district);
      if (!selectedDistrict) return;

      // Build search query - combine district name, cuisine, and text query
      let searchQuery = selectedDistrict.label;
      if (cuisine) {
        searchQuery += ` ${cuisine}`;
      }
      if (query.trim()) {
        searchQuery += ` ${query.trim()}`;
      }
      searchQuery += ' restaurant';

      setSearchParams({
        query: searchQuery,
        location: selectedDistrict.location,
        radius: 5000,
      });
    },
    [query, cuisine, country, district, setSearchParams]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">
            Country / City
          </label>
          <select
            id="country-select"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setDistrict('');
            }}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="district-select" className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <select
            id="district-select"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!country}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Districts</option>
            {country &&
              DISTRICT_OPTIONS[country]?.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="cuisine-select" className="block text-sm font-medium text-gray-700 mb-1">
            Cuisine
          </label>
          <select
            id="cuisine-select"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                setCountry('');
                setDistrict('');
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
        <Button type="submit" isLoading={isLoading} disabled={!country || !district}>
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
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-gray-600">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm text-gray-700 border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="distance">Distance</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
          {paginatedRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.place_id}
              restaurant={restaurant}
              onClick={() => onSelectRestaurant?.(restaurant.place_id)}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and nearby pages
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, arr) => (
                    <span key={page} className="flex items-center">
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
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
