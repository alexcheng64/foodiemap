'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  BookmarkWithTags,
  BookmarkFilters,
  CreateBookmarkInput,
  UpdateBookmarkInput,
} from '@/types/bookmark';

const BOOKMARKS_KEY = 'bookmarks';

export function useBookmarks(filters?: BookmarkFilters) {
  const supabase = createClient();

  return useQuery({
    queryKey: [BOOKMARKS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('bookmarks')
        .select(
          `
          *,
          bookmark_tags (
            tag_id,
            tags (*)
          )
        `
        )
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.visitStatus && filters.visitStatus !== 'all') {
        query = query.eq('visit_status', filters.visitStatus);
      }

      if (filters?.search) {
        query = query.ilike('restaurant_name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to include tags as a flat array
      const bookmarks: BookmarkWithTags[] = (data || []).map((bookmark) => ({
        ...bookmark,
        tags:
          bookmark.bookmark_tags?.map((bt: { tags: unknown }) => bt.tags) || [],
        bookmark_tags: undefined,
      }));

      // Filter by tags if specified
      if (filters?.tagIds && filters.tagIds.length > 0) {
        return bookmarks.filter((bookmark) =>
          bookmark.tags.some((tag) => filters.tagIds!.includes(tag.id))
        );
      }

      return bookmarks;
    },
  });
}

export function useBookmark(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [BOOKMARKS_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(
          `
          *,
          bookmark_tags (
            tag_id,
            tags (*)
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      const bookmark: BookmarkWithTags = {
        ...data,
        tags: data.bookmark_tags?.map((bt: { tags: unknown }) => bt.tags) || [],
        bookmark_tags: undefined,
      };

      return bookmark;
    },
    enabled: !!id,
  });
}

export function useCreateBookmark() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookmarkInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_KEY] });
    },
  });
}

export function useUpdateBookmark() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateBookmarkInput & { id: string }) => {
      const { data, error } = await supabase
        .from('bookmarks')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_KEY, variables.id] });
    },
  });
}

export function useDeleteBookmark() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_KEY] });
    },
  });
}

export function useAddTagToBookmark() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookmarkId,
      tagId,
    }: {
      bookmarkId: string;
      tagId: string;
    }) => {
      const { error } = await supabase
        .from('bookmark_tags')
        .insert({ bookmark_id: bookmarkId, tag_id: tagId });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_KEY] });
      queryClient.invalidateQueries({
        queryKey: [BOOKMARKS_KEY, variables.bookmarkId],
      });
    },
  });
}

export function useRemoveTagFromBookmark() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookmarkId,
      tagId,
    }: {
      bookmarkId: string;
      tagId: string;
    }) => {
      const { error } = await supabase
        .from('bookmark_tags')
        .delete()
        .eq('bookmark_id', bookmarkId)
        .eq('tag_id', tagId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_KEY] });
      queryClient.invalidateQueries({
        queryKey: [BOOKMARKS_KEY, variables.bookmarkId],
      });
    },
  });
}
