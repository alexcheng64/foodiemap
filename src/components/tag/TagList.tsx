'use client';

import { useState } from 'react';
import { useTags, useDeleteTag } from '@/hooks/useTags';
import { TagChip } from './TagChip';
import { TagForm } from './TagForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { Tag } from '@/types/tag';

export function TagList() {
  const { data: tags, isLoading, error } = useTags();
  const deleteTag = useDeleteTag();
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Tag | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load tags. Please try again.
      </div>
    );
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    await deleteTag.mutateAsync(showDeleteConfirm.id);
    setShowDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Your Tags</h2>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          Create Tag
        </Button>
      </div>

      {!tags || tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tags yet. Create one to organize your bookmarks.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border"
            >
              <TagChip tag={tag} />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingTag(tag)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Edit tag"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(tag)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label="Delete tag"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Tag"
      >
        <TagForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTag}
        onClose={() => setEditingTag(null)}
        title="Edit Tag"
      >
        {editingTag && (
          <TagForm tag={editingTag} onSuccess={() => setEditingTag(null)} />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Tag"
        size="sm"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the tag &quot;{showDeleteConfirm?.name}&quot;?
            This will remove it from all bookmarks.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteTag.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
