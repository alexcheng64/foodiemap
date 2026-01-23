'use client';

import { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/components/providers/AuthProvider';
import type { BookmarkWithTags } from '@/types/bookmark';

function MyLocationButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleClick = useCallback(() => {
    if (!map || !navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.panTo({ lat: latitude, lng: longitude });
        map.setZoom(15);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        alert('Unable to get your location. Please check your browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  return (
    <button
      onClick={handleClick}
      disabled={isLocating}
      className="absolute bottom-6 right-4 z-10 bg-white rounded-lg shadow-md p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      title="Go to my location"
    >
      {isLocating ? (
        <svg className="w-5 h-5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}

function AutoZoomToLocation() {
  const map = useMap();
  const [hasZoomed, setHasZoomed] = useState(false);

  useEffect(() => {
    if (!map || hasZoomed || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.panTo({ lat: latitude, lng: longitude });
        map.setZoom(15);
        setHasZoomed(true);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Silently fail - keep default location
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map, hasZoomed]);

  return null; // This component doesn't render anything
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const DEFAULT_ZOOM = 12;

export function MapContainer() {
  const { user } = useAuth();
  const { data: bookmarks } = useBookmarks();
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithTags | null>(null);

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
      <div className="relative w-full h-full">
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
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
          <AutoZoomToLocation />
        </Map>
        <MyLocationButton />
      </div>
    </APIProvider>
  );
}
