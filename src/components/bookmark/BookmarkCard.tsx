'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { TagChip } from '@/components/tag/TagChip';
import type { BookmarkWithTags } from '@/types/bookmark';

interface BookmarkCardProps {
  bookmark: BookmarkWithTags;
  onDelete?: () => void;
}

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderPriceLevel = (level: number | null) => {
    if (!level) return null;
    return (
      <span className="text-green-600 font-medium">
        {'$'.repeat(level)}
        <span className="text-gray-300">{'$'.repeat(4 - level)}</span>
      </span>
    );
  };

  return (
    <Card hover className="group">
      <div className="flex gap-4">
        {/* Photo */}
        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
          {bookmark.photo_reference ? (
            <img
              src={`/api/places/photo?reference=${bookmark.photo_reference}&maxwidth=200`}
              alt={bookmark.restaurant_name}
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
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/bookmarks/${bookmark.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 truncate"
            >
              {bookmark.restaurant_name}
            </Link>
            <span
              className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
                bookmark.visit_status === 'visited'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {bookmark.visit_status === 'visited' ? 'Visited' : 'Want to Visit'}
            </span>
          </div>

          <p className="text-sm text-gray-500 truncate mt-1">
            {bookmark.address}
          </p>

          <div className="flex items-center gap-4 mt-2">
            {bookmark.google_rating && (
              <div className="flex items-center gap-1 text-sm">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">{bookmark.google_rating}</span>
                {bookmark.google_rating_count && (
                  <span className="text-gray-400">
                    ({bookmark.google_rating_count})
                  </span>
                )}
              </div>
            )}
            {renderPriceLevel(bookmark.price_level)}
            {bookmark.personal_rating && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Your rating:</span>
                {renderStars(bookmark.personal_rating)}
              </div>
            )}
          </div>

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {bookmark.tags.map((tag) => (
                <TagChip key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
            aria-label="Delete bookmark"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
}
