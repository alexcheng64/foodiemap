'use client';

import { useState } from 'react';
import { useCreateTag, useUpdateTag } from '@/hooks/useTags';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TAG_COLORS, type Tag } from '@/types/tag';
import { cn } from '@/utils/cn';

interface TagFormProps {
  tag?: Tag;
  onSuccess?: () => void;
}

export function TagForm({ tag, onSuccess }: TagFormProps) {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || TAG_COLORS[0]);
  const [error, setError] = useState('');

  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const isEditing = !!tag;
  const isPending = createTag.isPending || updateTag.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      if (isEditing) {
        await updateTag.mutateAsync({ id: tag.id, name: name.trim(), color });
      } else {
        await createTag.mutateAsync({ name: name.trim(), color });
      }
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('duplicate')) {
          setError('A tag with this name already exists');
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Tag Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Date Night"
        error={error}
        maxLength={50}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'w-8 h-8 rounded-full transition-transform',
                color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
              )}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isPending}>
          {isEditing ? 'Update' : 'Create'} Tag
        </Button>
      </div>
    </form>
  );
}
