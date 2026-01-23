const GOOGLE_PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

export function getGoogleApiKey(): string {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set');
  }
  return apiKey;
}

export interface PlaceSearchParams {
  query: string;
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number;
  type?: string;
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
  };
  types?: string[];
}

export async function searchPlaces(
  params: PlaceSearchParams
): Promise<PlaceSearchResult[]> {
  const apiKey = getGoogleApiKey();

  const searchParams = new URLSearchParams({
    query: params.query,
    key: apiKey,
    type: params.type || 'restaurant',
  });

  if (params.location) {
    searchParams.set(
      'location',
      `${params.location.lat},${params.location.lng}`
    );
    searchParams.set('radius', String(params.radius || 5000));
  }

  const response = await fetch(
    `${GOOGLE_PLACES_API_BASE}/textsearch/json?${searchParams}`
  );

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${data.status}`);
  }

  return data.results || [];
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  formatted_phone_number?: string;
  website?: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  types?: string[];
}

export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  const apiKey = getGoogleApiKey();

  const fields = [
    'place_id',
    'name',
    'formatted_address',
    'geometry',
    'rating',
    'user_ratings_total',
    'price_level',
    'formatted_phone_number',
    'website',
    'photos',
    'opening_hours',
    'types',
  ].join(',');

  const searchParams = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    fields,
  });

  const response = await fetch(
    `${GOOGLE_PLACES_API_BASE}/details/json?${searchParams}`
  );

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    if (data.status === 'NOT_FOUND') {
      return null;
    }
    throw new Error(`Google Places API error: ${data.status}`);
  }

  return data.result;
}

export function getPhotoUrl(
  photoReference: string,
  maxWidth: number = 400
): string {
  const apiKey = getGoogleApiKey();
  return `${GOOGLE_PLACES_API_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}
