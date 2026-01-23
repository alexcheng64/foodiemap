'use client';

import { useState } from 'react';
import { useBookmarks, useDeleteBookmark } from '@/hooks/useBookmarks';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkFilters } from './BookmarkFilters';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { BookmarkFilters as Filters, BookmarkWithTags } from '@/types/bookmark';

export function BookmarkList() {
  const [filters, setFilters] = useState<Filters>({
    visitStatus: 'all',
    tagIds: [],
    search: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<BookmarkWithTags | null>(null);

  const { data: bookmarks, isLoading, error } = useBookmarks(filters);
  const deleteBookmark = useDeleteBookmark();

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteBookmark.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load bookmarks. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="sticky top-20 bg-white p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
          <BookmarkFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Bookmark List */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {bookmarks?.length || 0} bookmark{bookmarks?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!bookmarks || bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookmarks found
            </h3>
            <p className="text-gray-500">
              {filters.search || filters.tagIds?.length
                ? 'Try adjusting your filters'
                : 'Start by searching for restaurants and bookmarking them'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={() => setDeleteConfirm(bookmark)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Bookmark"
        size="sm"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete &quot;{deleteConfirm?.restaurant_name}&quot;
            from your bookmarks?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteBookmark.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
