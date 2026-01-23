'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/components/providers/AuthProvider';
import type { BookmarkWithTags } from '@/types/bookmark';

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const DEFAULT_ZOOM = 12;

export function MapContainer() {
  const { user } = useAuth();
  const { data: bookmarks } = useBookmarks();
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithTags | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // User denied location, use default
        }
      );
    }
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={DEFAULT_ZOOM}
        mapId="foodiemap-main"
        className="w-full h-full"
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {/* User's bookmarked restaurants */}
        {user &&
          bookmarks?.map((bookmark) => (
            <Marker
              key={bookmark.id}
              position={{ lat: bookmark.latitude, lng: bookmark.longitude }}
              onClick={() => setSelectedBookmark(bookmark)}
              title={bookmark.restaurant_name}
            />
          ))}

        {/* Info Window for selected bookmark */}
        {selectedBookmark && (
          <InfoWindow
            position={{
              lat: selectedBookmark.latitude,
              lng: selectedBookmark.longitude,
            }}
            onCloseClick={() => setSelectedBookmark(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-gray-900">
                {selectedBookmark.restaurant_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedBookmark.address}
              </p>
              {selectedBookmark.google_rating && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{selectedBookmark.google_rating}</span>
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <a
                  href={`/bookmarks/${selectedBookmark.id}`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  View details
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
