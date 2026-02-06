import { MainLayout } from '@/components/layout/MainLayout';
import { BookmarkList } from '@/components/bookmark/BookmarkList';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Bookmarks - FoodieMap',
  description: 'View and manage your bookmarked restaurants',
};

export default async function BookmarksPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/bookmarks');
  }

  return (
    <MainLayout>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookmarks</h1>
          <BookmarkList />
        </div>
      </div>
    </MainLayout>
  );
}
