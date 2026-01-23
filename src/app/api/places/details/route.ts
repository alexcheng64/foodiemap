import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

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

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data);
      return NextResponse.json({ error: data.error_message || 'Failed to get details' }, { status: 500 });
    }

    const place = data.result;
    const restaurant = {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      geometry: place.geometry,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      formatted_phone_number: place.formatted_phone_number,
      website: place.website,
      photos: place.photos,
      opening_hours: place.opening_hours,
      types: place.types,
    };

    return NextResponse.json({ restaurant, details: place });
  } catch (error) {
    console.error('Details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
