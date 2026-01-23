import { MainLayout } from '@/components/layout/MainLayout';
import { MapContainer } from '@/components/map/MapContainer';
import { createServerClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <MainLayout>
      <div className="flex h-full">
        <div className="flex-1 relative">
          <MapContainer />
        </div>
      </div>
    </MainLayout>
  );
}
