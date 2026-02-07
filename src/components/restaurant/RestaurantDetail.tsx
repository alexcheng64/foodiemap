'use client';

import { useRestaurantDetails, useBookmarkRestaurant } from '@/hooks/useRestaurantSearch';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useState } from 'react';

interface RestaurantDetailProps {
  placeId: string;
  onClose?: () => void;
}

export function RestaurantDetail({ placeId, onClose }: RestaurantDetailProps) {
  const { user } = useAuth();
  const { data: restaurant, isLoading, error } = useRestaurantDetails(placeId);
  const { data: bookmarks } = useBookmarks();
  const bookmarkMutation = useBookmarkRestaurant();
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  const isBookmarked = bookmarks?.some(
    (b) => b.google_place_id === placeId
  );

  const handleBookmark = async () => {
    if (!restaurant) return;
    setBookmarkError(null);
    try {
      await bookmarkMutation.mutateAsync(restaurant);
    } catch (err) {
      if (err instanceof Error) {
        setBookmarkError(err.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load restaurant details.
      </div>
    );
  }

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return (
      <span className="text-green-600 font-medium">
        {'$'.repeat(level)}
        <span className="text-gray-300">{'$'.repeat(4 - level)}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
        <p className="text-gray-500">{restaurant.formatted_address}</p>
      </div>

      {/* Rating and price */}
      <div className="flex items-center gap-4">
        {restaurant.rating && (
          <div className="flex items-center gap-1">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">{restaurant.rating}</span>
            {restaurant.user_ratings_total && (
              <span className="text-gray-400 text-sm">
                ({restaurant.user_ratings_total} reviews)
              </span>
            )}
          </div>
        )}
        {renderPriceLevel(restaurant.price_level)}
        {restaurant.opening_hours?.open_now !== undefined && (
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              restaurant.opening_hours.open_now
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {restaurant.opening_hours.open_now ? 'Open Now' : 'Closed'}
          </span>
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-2">
        {restaurant.formatted_phone_number && (
          <a
            href={`tel:${restaurant.formatted_phone_number}`}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {restaurant.formatted_phone_number}
          </a>
        )}
        {restaurant.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            Visit website
          </a>
        )}
      </div>

      {/* Opening hours */}
      {restaurant.opening_hours?.weekday_text && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Hours</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {restaurant.opening_hours.weekday_text.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        {user ? (
          isBookmarked ? (
            <Button variant="secondary" disabled>
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Bookmarked
            </Button>
          ) : (
            <Button onClick={handleBookmark} isLoading={bookmarkMutation.isPending}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              Bookmark
            </Button>
          )
        ) : (
          <a href="/login">
            <Button variant="outline">Sign in to bookmark</Button>
          </a>
        )}

        <a
          href={`https://www.google.com/maps/place/?q=place_id:${placeId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">View on Google Maps</Button>
        </a>

        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {bookmarkError && (
        <p className="text-sm text-red-600">{bookmarkError}</p>
      )}
    </div>
  );
}
