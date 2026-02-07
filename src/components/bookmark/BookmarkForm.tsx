'use client';

import { useState } from 'react';
import { useUpdateBookmark, useAddTagToBookmark, useRemoveTagFromBookmark } from '@/hooks/useBookmarks';
import { useTags } from '@/hooks/useTags';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagChip } from '@/components/tag/TagChip';
import type { BookmarkWithTags, VisitStatus } from '@/types/bookmark';

interface BookmarkFormProps {
  bookmark: BookmarkWithTags;
  onSuccess?: () => void;
}

export function BookmarkForm({ bookmark, onSuccess }: BookmarkFormProps) {
  const [personalNote, setPersonalNote] = useState(bookmark.personal_note || '');
  const [personalRating, setPersonalRating] = useState(bookmark.personal_rating || 0);
  const [visitStatus, setVisitStatus] = useState<VisitStatus>(bookmark.visit_status);
  const [visitedAt, setVisitedAt] = useState(bookmark.visited_at || '');

  const { data: allTags } = useTags();
  const updateBookmark = useUpdateBookmark();
  const addTag = useAddTagToBookmark();
  const removeTag = useRemoveTagFromBookmark();

  const bookmarkTagIds = bookmark.tags.map((t) => t.id);
  const availableTags = allTags?.filter((t) => !bookmarkTagIds.includes(t.id)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBookmark.mutateAsync({
      id: bookmark.id,
      personal_note: personalNote || null,
      personal_rating: personalRating || null,
      visit_status: visitStatus,
      visited_at: visitStatus === 'visited' ? visitedAt || null : null,
    });
    onSuccess?.();
  };

  const handleAddTag = async (tagId: string) => {
    await addTag.mutateAsync({ bookmarkId: bookmark.id, tagId });
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTag.mutateAsync({ bookmarkId: bookmark.id, tagId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Visit Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visit Status
        </label>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setVisitStatus('not_visited')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              visitStatus === 'not_visited'
                ? 'bg-gray-100 border-gray-500 text-gray-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Not Visited
          </button>
          <button
            type="button"
            onClick={() => setVisitStatus('want_to_visit')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              visitStatus === 'want_to_visit'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Want to Visit
          </button>
          <button
            type="button"
            onClick={() => setVisitStatus('visited')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              visitStatus === 'visited'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Visited
          </button>
        </div>
      </div>

      {/* Visited Date */}
      {visitStatus === 'visited' && (
        <Input
          type="date"
          label="Date Visited"
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
        />
      )}

      {/* Personal Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setPersonalRating(star === personalRating ? 0 : star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= personalRating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Personal Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          placeholder="Add your notes about this restaurant..."
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>

        {/* Current tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {bookmark.tags.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                onRemove={() => handleRemoveTag(tag.id)}
              />
            ))}
          </div>
        )}

        {/* Available tags to add */}
        {availableTags.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Click to add:</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  onClick={() => handleAddTag(tag.id)}
                />
              ))}
            </div>
          </div>
        )}

        {bookmark.tags.length === 0 && availableTags.length === 0 && (
          <p className="text-sm text-gray-500">
            No tags available. Create tags in the Tags page.
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" isLoading={updateBookmark.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
