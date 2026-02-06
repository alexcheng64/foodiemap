import { NextResponse } from 'next/server';

// Helper to wait (needed for Google's next_page_token)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, location, radius = 5000 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    const allResults: any[] = [];
    let nextPageToken: string | null = null;
    let pageCount = 0;
    const maxPages = 3; // Google allows up to 3 pages (60 results max)

    do {
      const params = new URLSearchParams({
        query: `${query} restaurant`,
        key: apiKey,
        type: 'restaurant',
      });

      if (location) {
        params.append('location', `${location.lat},${location.lng}`);
        params.append('radius', radius.toString());
      }

      if (nextPageToken) {
        params.append('pagetoken', nextPageToken);
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
      );

      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        // If it's the first page, return error; otherwise return what we have
        if (pageCount === 0) {
          console.error('Google Places API error:', data);
          return NextResponse.json({ error: data.error_message || 'Search failed' }, { status: 500 });
        }
        break;
      }

      allResults.push(...(data.results || []));
      nextPageToken = data.next_page_token || null;
      pageCount++;

      // Google requires a short delay before using next_page_token
      if (nextPageToken && pageCount < maxPages) {
        await delay(2000);
      }
    } while (nextPageToken && pageCount < maxPages);

    const restaurants = allResults.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      geometry: place.geometry,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      photos: place.photos,
      opening_hours: place.opening_hours,
      types: place.types,
    }));

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
