'use client';

import { Input } from '@/components/ui/Input';
import { TagChip } from '@/components/tag/TagChip';
import { useTags } from '@/hooks/useTags';
import type { BookmarkFilters as Filters, VisitStatus } from '@/types/bookmark';

interface BookmarkFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function BookmarkFilters({ filters, onChange }: BookmarkFiltersProps) {
  const { data: tags } = useTags();

  const statusOptions: { value: VisitStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'want_to_visit', label: 'Want to Visit' },
    { value: 'visited', label: 'Visited' },
  ];

  const toggleTag = (tagId: string) => {
    const currentTags = filters.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    onChange({ ...filters, tagIds: newTags });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search bookmarks..."
        value={filters.search || ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onChange({ ...filters, visitStatus: option.value })
              }
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                (filters.visitStatus || 'all') === option.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      {tags && tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                onClick={() => toggleTag(tag.id)}
                selected={filters.tagIds?.includes(tag.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {(filters.search ||
        filters.visitStatus !== 'all' ||
        (filters.tagIds && filters.tagIds.length > 0)) && (
        <button
          onClick={() =>
            onChange({ visitStatus: 'all', tagIds: [], search: '' })
          }
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
