import { MainLayout } from '@/components/layout/MainLayout';
import { TagList } from '@/components/tag/TagList';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tags - FoodieMap',
  description: 'Manage your tags for organizing bookmarks',
};

export default async function TagsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/tags');
  }

  return (
    <MainLayout>
      <div className="flex-1 min-w-0 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>
          <TagList />
        </div>
      </div>
    </MainLayout>
  );
}
