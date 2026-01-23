'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useBookmarkRestaurant } from '@/hooks/useRestaurantSearch';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBookmarks } from '@/hooks/useBookmarks';
import type { Restaurant } from '@/types/restaurant';
import { useState } from 'react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const { user } = useAuth();
  const { data: bookmarks } = useBookmarks();
  const bookmarkMutation = useBookmarkRestaurant();
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  const isBookmarked = bookmarks?.some(
    (b) => b.google_place_id === restaurant.place_id
  );

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkError(null);
    try {
      await bookmarkMutation.mutateAsync(restaurant);
    } catch (err) {
      if (err instanceof Error) {
        setBookmarkError(err.message);
      }
    }
  };

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
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="flex gap-4">
        {/* Photo placeholder */}
        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
          {restaurant.photos?.[0]?.photo_reference ? (
            <img
              src={`/api/places/photo?reference=${restaurant.photos[0].photo_reference}&maxwidth=200`}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {restaurant.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {restaurant.formatted_address}
          </p>

          <div className="flex items-center gap-4 mt-2">
            {restaurant.rating && (
              <div className="flex items-center gap-1 text-sm">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">{restaurant.rating}</span>
                {restaurant.user_ratings_total && (
                  <span className="text-gray-400">
                    ({restaurant.user_ratings_total})
                  </span>
                )}
              </div>
            )}
            {renderPriceLevel(restaurant.price_level)}
            {restaurant.opening_hours?.open_now !== undefined && (
              <span
                className={`text-sm ${
                  restaurant.opening_hours.open_now
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {restaurant.opening_hours.open_now ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>

        {/* Bookmark button */}
        {user && (
          <div className="flex-shrink-0">
            {isBookmarked ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Saved
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleBookmark}
                isLoading={bookmarkMutation.isPending}
              >
                <svg
                  className="w-4 h-4 mr-1"
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
                Save
              </Button>
            )}
            {bookmarkError && (
              <p className="text-xs text-red-600 mt-1">{bookmarkError}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
