'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RestaurantSearch } from '@/components/restaurant/RestaurantSearch';
import { RestaurantDetail } from '@/components/restaurant/RestaurantDetail';
import { Modal } from '@/components/ui/Modal';

export default function SearchPage() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  return (
    <MainLayout>
      <div className="flex-1 min-w-0 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Search Restaurants
          </h1>
          <RestaurantSearch onSelectRestaurant={setSelectedPlaceId} />
        </div>
      </div>

      {/* Restaurant Detail Modal */}
      <Modal
        isOpen={!!selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
        title="Restaurant Details"
        size="lg"
      >
        {selectedPlaceId && (
          <RestaurantDetail
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
          />
        )}
      </Modal>
    </MainLayout>
  );
}
