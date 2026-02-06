import { MainLayout } from '@/components/layout/MainLayout';
import { MapContainer } from '@/components/map/MapContainer';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <MainLayout>
      <div className="flex flex-1 w-full h-full">
        <div className="flex-1 relative" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <MapContainer />
        </div>
      </div>
    </MainLayout>
  );
}
