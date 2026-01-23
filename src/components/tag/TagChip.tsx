import { cn } from '@/utils/cn';
import type { Tag } from '@/types/tag';

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md';
}

export function TagChip({
  tag,
  onRemove,
  onClick,
  selected = false,
  size = 'md',
}: TagChipProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
        sizes[size],
        onClick && 'cursor-pointer',
        selected
          ? 'ring-2 ring-offset-1'
          : ''
      )}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        borderColor: tag.color,
        ...(selected && { ringColor: tag.color }),
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-black/10 rounded-full p-0.5"
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
