'use client';

import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookmarkForm } from '@/components/bookmark/BookmarkForm';
import { useBookmark, useDeleteBookmark } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { TagChip } from '@/components/tag/TagChip';
import { useState } from 'react';
import Link from 'next/link';

export default function BookmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: bookmark, isLoading, error } = useBookmark(id);
  const deleteBookmark = useDeleteBookmark();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    await deleteBookmark.mutateAsync(id);
    router.push('/bookmarks');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !bookmark) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bookmark not found
            </h2>
            <Link href="/bookmarks" className="text-primary-600 hover:underline">
              Back to bookmarks
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <Link
            href="/bookmarks"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to bookmarks
          </Link>

          {/* Header */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {bookmark.restaurant_name}
                </h1>
                <p className="text-gray-500 mt-1">{bookmark.address}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  bookmark.visit_status === 'visited'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {bookmark.visit_status === 'visited' ? 'Visited' : 'Want to Visit'}
              </span>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {bookmark.google_rating && (
                <div>
                  <p className="text-sm text-gray-500">Google Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{bookmark.google_rating}</span>
                    {bookmark.google_rating_count && (
                      <span className="text-gray-400 text-sm">
                        ({bookmark.google_rating_count})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {bookmark.price_level && (
                <div>
                  <p className="text-sm text-gray-500">Price Level</p>
                  <p className="font-semibold text-green-600 mt-1">
                    {'$'.repeat(bookmark.price_level)}
                  </p>
                </div>
              )}

              {bookmark.personal_rating && (
                <div>
                  <p className="text-sm text-gray-500">Your Rating</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= bookmark.personal_rating!
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              )}

              {bookmark.visited_at && (
                <div>
                  <p className="text-sm text-gray-500">Visited</p>
                  <p className="font-semibold mt-1">
                    {new Date(bookmark.visited_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="flex gap-4 mt-6">
              {bookmark.phone && (
                <a
                  href={`tel:${bookmark.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                >
                  <svg
                    className="w-4 h-4"
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
                  {bookmark.phone}
                </a>
              )}
              {bookmark.website && (
                <a
                  href={bookmark.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                >
                  <svg
                    className="w-4 h-4"
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
                  Website
                </a>
              )}
            </div>

            {/* Tags */}
            {bookmark.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {bookmark.tags.map((tag) => (
                    <TagChip key={tag.id} tag={tag} />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {bookmark.personal_note && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-2">Your Notes</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {bookmark.personal_note}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button onClick={() => setShowEditModal(true)}>Edit</Button>
              <Button variant="outline" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${bookmark.google_place_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary">View on Google Maps</Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Bookmark"
        size="lg"
      >
        <BookmarkForm
          bookmark={bookmark}
          onSuccess={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Bookmark"
        size="sm"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete &quot;{bookmark.restaurant_name}&quot;?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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
    </MainLayout>
  );
}
