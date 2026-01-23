# FoodieMap - System Architecture Document

## 1. Overview

This document describes the technical architecture for FoodieMap, a restaurant bookmarking web application that integrates with Google Maps for data and synchronization.

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                     React SPA (TypeScript)                       │     │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │     │
│   │  │   Google    │  │   React     │  │     Supabase Client     │  │     │
│   │  │  Maps SDK   │  │   Query     │  │   (@supabase/supabase-js)│  │     │
│   │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                    │                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE PLATFORM                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐     │
│   │  Supabase     │  │   PostgREST   │  │    Edge Functions         │     │
│   │  Auth         │  │  (Auto-API)   │  │    (Deno Runtime)         │     │
│   │               │  │               │  │                           │     │
│   │  • Google     │  │  • Bookmarks  │  │  • google-places-search   │     │
│   │    OAuth      │  │  • Tags       │  │  • google-places-details  │     │
│   │  • Session    │  │  • Profiles   │  │  • sync-to-google         │     │
│   │    Management │  │  • Filtering  │  │  • sync-from-google       │     │
│   └───────────────┘  └───────────────┘  └───────────────────────────┘     │
│                                                                            │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐     │
│   │  PostgreSQL   │  │   Realtime    │  │      Storage              │     │
│   │  Database     │  │               │  │                           │     │
│   │               │  │  • Live       │  │  • Cached photos          │     │
│   │  • RLS        │  │    bookmark   │  │  • User uploads           │     │
│   │    Policies   │  │    updates    │  │    (future)               │     │
│   │  • pg_cron    │  │               │  │                           │     │
│   └───────────────┘  └───────────────┘  └───────────────────────────┘     │
│                              │                                             │
└──────────────────────────────┼─────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                    │
├────────────────────────────────────────────────────────────────────────────┤
│   ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐    │
│   │  Google OAuth 2.0  │  │  Google Places API │  │  Google Maps     │    │
│   │  (via Supabase)    │  │                    │  │  Saved Lists     │    │
│   └────────────────────┘  └────────────────────┘  └──────────────────┘    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18 | UI component library |
| Language | TypeScript 5 | Type-safe development |
| Styling | Tailwind CSS | Utility-first CSS |
| State Management | React Query (TanStack Query) | Server state & caching |
| Routing | React Router v6 | Client-side routing |
| Maps | @googlemaps/js-api-loader | Google Maps integration |
| HTTP Client | Axios | API communication |
| Forms | React Hook Form + Zod | Form handling & validation |

### 3.2 Backend (Supabase)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Platform | Supabase | Backend-as-a-Service |
| Database | Supabase PostgreSQL | Managed relational database |
| Auth | Supabase Auth | Google OAuth, session management |
| API | PostgREST | Auto-generated REST API from schema |
| Custom Logic | Supabase Edge Functions | Deno-based serverless functions |
| Realtime | Supabase Realtime | WebSocket subscriptions |
| Scheduled Jobs | pg_cron | Database-level scheduled tasks |
| Validation | Zod (in Edge Functions) | Request validation |

### 3.3 Data Storage

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary Database | Supabase PostgreSQL | Relational data with RLS |
| File Storage | Supabase Storage | Photo caching, future uploads |
| Caching | Database tables with TTL | Google Places data cache |

### 3.4 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend Hosting | Supabase (managed) | Fully managed backend |
| Frontend Hosting | Vercel / Netlify | Static site hosting with CDN |
| CI/CD | GitHub Actions | Automated testing & deployment |
| Supabase CLI | Local development | Local Supabase instance |

---

## 4. Component Architecture

### 4.1 Frontend Components

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Input/
│   │   └── Card/
│   ├── map/                 # Map-related components
│   │   ├── MapContainer/
│   │   ├── MapMarker/
│   │   └── MapControls/
│   ├── restaurant/          # Restaurant components
│   │   ├── RestaurantCard/
│   │   ├── RestaurantDetail/
│   │   └── RestaurantSearch/
│   ├── bookmark/            # Bookmark components
│   │   ├── BookmarkList/
│   │   ├── BookmarkCard/
│   │   └── BookmarkFilters/
│   └── layout/              # Layout components
│       ├── Header/
│       ├── Sidebar/
│       └── MainLayout/
├── pages/
│   ├── HomePage/
│   ├── SearchPage/
│   ├── BookmarksPage/
│   ├── SettingsPage/
│   └── AuthCallback/
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useBookmarks.ts
│   ├── useGoogleMaps.ts
│   └── useTags.ts
├── services/                # API service layer
│   ├── api.ts
│   ├── auth.service.ts
│   ├── bookmark.service.ts
│   ├── restaurant.service.ts
│   └── sync.service.ts
├── stores/                  # Global state (if needed)
│   └── authStore.ts
├── types/                   # TypeScript definitions
│   ├── bookmark.ts
│   ├── restaurant.ts
│   └── user.ts
└── utils/                   # Utility functions
    ├── formatters.ts
    └── validators.ts
```

### 4.2 Backend Components (Supabase)

```
supabase/
├── functions/                      # Edge Functions (Deno)
│   ├── google-places-search/
│   │   └── index.ts               # Search restaurants via Places API
│   ├── google-places-details/
│   │   └── index.ts               # Get restaurant details
│   ├── google-places-photos/
│   │   └── index.ts               # Proxy photos from Places API
│   ├── sync-to-google/
│   │   └── index.ts               # Push bookmarks to Google Maps
│   ├── sync-from-google/
│   │   └── index.ts               # Pull from Google Maps lists
│   └── _shared/
│       ├── cors.ts                # CORS headers helper
│       ├── google-client.ts       # Google API client
│       └── supabase-client.ts     # Supabase admin client
├── migrations/                     # Database migrations
│   ├── 00001_create_profiles.sql
│   ├── 00002_create_bookmarks.sql
│   ├── 00003_create_tags.sql
│   ├── 00004_create_bookmark_tags.sql
│   ├── 00005_create_google_maps_sync.sql
│   ├── 00006_create_places_cache.sql
│   └── 00007_enable_rls_policies.sql
├── seed.sql                        # Development seed data
└── config.toml                     # Supabase local config

# Database objects managed via migrations:
# - Tables with RLS policies
# - Functions for complex queries
# - Triggers for updated_at timestamps
# - pg_cron jobs for scheduled sync
```

**Note:** CRUD operations for bookmarks, tags, and profiles are handled automatically by PostgREST. Edge Functions are only needed for:
- Google Maps API proxy (to protect API keys)
- Google Maps sync operations
- Any complex business logic

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       auth.users                                 │
│                  (Managed by Supabase)                          │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ UUID                                     │
│    │ email           │ VARCHAR(255)                             │
│    │ (+ OAuth data managed internally by Supabase Auth)         │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 1:1
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                          profiles                                │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ UUID (FK → auth.users.id)                │
│    │ display_name    │ VARCHAR(255)                             │
│    │ avatar_url      │ TEXT                                     │
│    │ created_at      │ TIMESTAMP                                │
│    │ updated_at      │ TIMESTAMP                                │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                          bookmarks                               │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                │ UUID                                   │
│ FK │ user_id           │ UUID → auth.users.id                   │
│    │ google_place_id   │ VARCHAR(255)                           │
│    │ restaurant_name   │ VARCHAR(255)                           │
│    │ address           │ TEXT                                   │
│    │ latitude          │ DECIMAL(10,8)                          │
│    │ longitude         │ DECIMAL(11,8)                          │
│    │ google_rating     │ DECIMAL(2,1)                           │
│    │ google_rating_cnt │ INTEGER                                │
│    │ price_level       │ SMALLINT                               │
│    │ phone             │ VARCHAR(50)                            │
│    │ website           │ TEXT                                   │
│    │ photo_reference   │ TEXT                                   │
│    │ personal_note     │ TEXT                                   │
│    │ personal_rating   │ SMALLINT                               │
│    │ visit_status      │ ENUM('want_to_visit','visited')        │
│    │ visited_at        │ DATE                                   │
│    │ synced_to_google  │ BOOLEAN DEFAULT false                  │
│    │ created_at        │ TIMESTAMP                              │
│    │ updated_at        │ TIMESTAMP                              │
│ UK │ (user_id, google_place_id)                                 │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ N:M
           ▼
┌─────────────────────────┐         ┌─────────────────────────────┐
│     bookmark_tags       │         │           tags              │
├─────────────────────────┤         ├─────────────────────────────┤
│ PK │ bookmark_id │ UUID │────────▶│ PK │ id        │ UUID       │
│ PK │ tag_id      │ UUID │◀────────│ FK │ user_id   │ UUID       │
└─────────────────────────┘         │    │ name      │ VARCHAR(50)│
                                    │    │ color     │ CHAR(7)    │
                                    │    │ created_at│ TIMESTAMP  │
                                    │ UK │ (user_id, name)         │
                                    └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      google_maps_sync                            │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ UUID                                     │
│ FK │ user_id         │ UUID → auth.users.id                     │
│    │ google_list_id  │ VARCHAR(255)                             │
│    │ google_list_name│ VARCHAR(255)                             │
│    │ sync_direction  │ ENUM('two_way','to_google','from_google')│
│    │ last_synced_at  │ TIMESTAMP                                │
│    │ sync_status     │ ENUM('idle','syncing','error')           │
│    │ error_message   │ TEXT                                     │
│    │ created_at      │ TIMESTAMP                                │
│    │ updated_at      │ TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_visit_status ON bookmarks(user_id, visit_status);
CREATE INDEX idx_bookmarks_location ON bookmarks USING GIST (
  ll_to_earth(latitude, longitude)
);  -- For geospatial queries
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_bookmark_tags_tag_id ON bookmark_tags(tag_id);
CREATE INDEX idx_sync_user_id ON google_maps_sync(user_id);
```

### 5.3 Row Level Security (RLS) Policies

Supabase uses PostgreSQL RLS to enforce authorization at the database level. All tables have RLS enabled with policies that restrict access to the authenticated user's own data.

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_maps_sync ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Bookmarks: users can CRUD their own bookmarks
CREATE POLICY "Users can CRUD own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Tags: users can CRUD their own tags
CREATE POLICY "Users can CRUD own tags"
  ON tags FOR ALL
  USING (auth.uid() = user_id);

-- Bookmark Tags: users can manage tags on their own bookmarks
CREATE POLICY "Users can manage own bookmark tags"
  ON bookmark_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bookmarks
      WHERE bookmarks.id = bookmark_tags.bookmark_id
      AND bookmarks.user_id = auth.uid()
    )
  );

-- Google Maps Sync: users can manage their own sync config
CREATE POLICY "Users can CRUD own sync config"
  ON google_maps_sync FOR ALL
  USING (auth.uid() = user_id);
```

### 5.4 Database Triggers

```sql
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookmarks_updated_at
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 6. API Design

### 6.1 API Architecture

FoodieMap uses two types of APIs:

1. **PostgREST (Auto-generated)**: Supabase automatically generates REST APIs for all database tables. Used for CRUD operations on bookmarks, tags, and profiles.

2. **Edge Functions (Custom)**: Deno-based serverless functions for operations requiring external API calls or complex logic.

### 6.2 PostgREST API (via Supabase Client)

The Supabase JavaScript client provides a fluent API for database operations. RLS policies automatically filter results to the authenticated user.

**Bookmarks:**
```typescript
// List bookmarks with filters
const { data, error } = await supabase
  .from('bookmarks')
  .select('*, tags(*)')
  .eq('visit_status', 'want_to_visit')
  .order('created_at', { ascending: false })
  .range(0, 19);

// Create bookmark
const { data, error } = await supabase
  .from('bookmarks')
  .insert({ google_place_id: 'xxx', restaurant_name: 'Example' })
  .select()
  .single();

// Update bookmark
const { data, error } = await supabase
  .from('bookmarks')
  .update({ personal_rating: 5, visit_status: 'visited' })
  .eq('id', bookmarkId)
  .select()
  .single();

// Delete bookmark
const { error } = await supabase
  .from('bookmarks')
  .delete()
  .eq('id', bookmarkId);
```

**Tags:**
```typescript
// List user's tags
const { data } = await supabase.from('tags').select('*');

// Create tag
const { data } = await supabase
  .from('tags')
  .insert({ name: 'Date Night', color: '#FF5733' })
  .select()
  .single();

// Add tag to bookmark
const { error } = await supabase
  .from('bookmark_tags')
  .insert({ bookmark_id: 'xxx', tag_id: 'yyy' });
```

### 6.3 Edge Functions API

Edge Functions are invoked via the Supabase client. They handle external API calls and complex operations.

**Google Places (Proxy):**
```typescript
// Search restaurants
const { data, error } = await supabase.functions.invoke('google-places-search', {
  body: { query: 'sushi', location: '37.7749,-122.4194', radius: 5000 }
});
// Returns: { restaurants: [...], nextPageToken?: string }

// Get restaurant details
const { data, error } = await supabase.functions.invoke('google-places-details', {
  body: { placeId: 'ChIJxx...' }
});
// Returns: { restaurant: {...} }

// Get photos
const { data, error } = await supabase.functions.invoke('google-places-photos', {
  body: { placeId: 'ChIJxx...', maxWidth: 400 }
});
// Returns: { photos: [{ url: '...' }, ...] }
```

**Google Maps Sync:**
```typescript
// Get user's Google Maps lists
const { data, error } = await supabase.functions.invoke('sync-get-lists');
// Returns: { lists: [...] }

// Trigger manual sync
const { data, error } = await supabase.functions.invoke('sync-trigger', {
  body: { direction: 'two_way' }
});
// Returns: { status: 'started', jobId: 'xxx' }

// Import from Google Maps list
const { data, error } = await supabase.functions.invoke('sync-import', {
  body: { listId: 'xxx' }
});
// Returns: { imported: 15, skipped: 3 }
```

### 6.4 Response Formats

**PostgREST Success:**
```json
{
  "data": [...],
  "error": null,
  "count": 150
}
```

**Edge Function Success:**
```json
{
  "restaurants": [...],
  "nextPageToken": "xxx"
}
```

**Error Response:**
```json
{
  "data": null,
  "error": {
    "message": "Row not found",
    "code": "PGRST116"
  }
}
```

---

## 7. Authentication Flow

### 7.1 Supabase Auth with Google OAuth

Supabase Auth handles the entire OAuth flow, including token management and session persistence.

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │ Supabase │     │  Google  │     │ Database │
│  (React) │     │   Auth   │     │  OAuth   │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ signInWithOAuth│                │                │
     │ ({provider:    │                │                │
     │   'google'})   │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │ Redirect URL   │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │ Browser redirect to Google      │                │
     │────────────────────────────────▶│                │
     │                │                │                │
     │ User consents, Google redirects │                │
     │◀────────────────────────────────│                │
     │                │                │                │
     │ Callback to    │                │                │
     │ Supabase       │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │                │ Exchange code, │                │
     │                │ get tokens &   │                │
     │                │ user info      │                │
     │                │───────────────▶│                │
     │                │◀───────────────│                │
     │                │                │                │
     │                │ Create/update user              │
     │                │ in auth.users                   │
     │                │───────────────────────────────▶│
     │                │                │                │
     │                │ Trigger: create profile         │
     │                │───────────────────────────────▶│
     │                │                │                │
     │ Redirect to app│                │                │
     │ with session   │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │ onAuthState    │                │                │
     │ Change fires   │                │                │
     │◀───────────────│                │                │
     │                │                │                │
```

### 7.2 Client-Side Implementation

```typescript
// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in with Google
const signIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'openid email profile'
    }
  });
};

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User signed in, session contains JWT
  } else if (event === 'SIGNED_OUT') {
    // User signed out
  }
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

### 7.3 Session Management

| Aspect | Supabase Handling |
|--------|-------------------|
| **Session Storage** | LocalStorage (configurable) |
| **Token Type** | JWT (access + refresh tokens) |
| **Access Token Expiry** | 1 hour (configurable) |
| **Refresh Token Expiry** | 1 week (configurable) |
| **Auto Refresh** | Handled automatically by client |
| **Token in Requests** | Added automatically by Supabase client |

### 7.4 Authorization via RLS

After authentication, all database queries are automatically filtered by RLS policies:

```typescript
// This query only returns bookmarks where user_id = auth.uid()
// No additional filtering needed in application code
const { data: bookmarks } = await supabase
  .from('bookmarks')
  .select('*');
```

---

## 8. Sync Service Architecture

### 8.1 Sync Flow (Supabase Edge Functions)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYNC TRIGGERS                                │
├─────────────────────────────────────────────────────────────────────┤
│  • User clicks manual sync button → Edge Function                   │
│  • Scheduled sync (pg_cron) → Edge Function                         │
│  • Database webhook on bookmark change → Edge Function              │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTION: sync-trigger                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Validate user authentication (JWT)                              │
│                          │                                           │
│                          ▼                                           │
│  2. Get user's sync config from google_maps_sync table              │
│                          │                                           │
│                          ▼                                           │
│  3. Update sync_status to 'syncing'                                 │
│                          │                                           │
│                          ▼                                           │
│  4. Fetch local bookmarks (via service role client)                 │
│                          │                                           │
│                          ▼                                           │
│  5. Fetch Google Maps list items (via Google API)                   │
│                          │                                           │
│                          ▼                                           │
│  6. Compare & Detect Changes                                        │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │  Local Only  │  Google Only  │  Both (compare timestamps) │   │
│     └──────┬───────┴───────┬───────┴──────────────┬───────────┘     │
│            │               │                      │                  │
│            ▼               ▼                      ▼                  │
│     Push to Google   Import to Local      Conflict Resolution       │
│                                                                      │
│  7. Update sync status & last_synced_at                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Scheduled Sync with pg_cron

```sql
-- Enable pg_cron extension (Supabase Dashboard > Database > Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule sync every 15 minutes for active users
SELECT cron.schedule(
  'sync-google-maps',
  '*/15 * * * *',  -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/sync-scheduled',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  )
  $$
);
```

### 8.3 Database Webhook Trigger

For real-time sync when bookmarks change:

```sql
-- Create webhook trigger for bookmark changes
CREATE OR REPLACE FUNCTION notify_bookmark_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/sync-on-change',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'action', TG_OP,
      'bookmark_id', COALESCE(NEW.id, OLD.id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER bookmark_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION notify_bookmark_change();
```

### 8.4 Conflict Resolution

| Scenario | Resolution Strategy |
|----------|---------------------|
| Added in both | Keep both, mark as synced |
| Deleted locally, exists in Google | Delete from Google (if two-way) |
| Deleted in Google, exists locally | Delete locally (if two-way) |
| Modified in both | Last-write-wins by timestamp |

### 8.5 Sync States

```
┌─────────┐     ┌──────────┐     ┌───────────┐
│  IDLE   │────▶│ SYNCING  │────▶│ COMPLETED │
└─────────┘     └────┬─────┘     └───────────┘
     ▲               │                 │
     │               ▼                 │
     │          ┌─────────┐            │
     └──────────│  ERROR  │◀───────────┘
                └─────────┘     (on failure)
```

---

## 9. Caching Strategy

### 9.1 Cache Layers

| Layer | Technology | TTL | Purpose |
|-------|------------|-----|---------|
| Browser | React Query | 5 min | UI responsiveness, optimistic updates |
| Database | places_cache table | 24 hours | Reduce Google API costs |
| Supabase | Built-in connection pooling | - | Database connection efficiency |

### 9.2 Google Places Cache Table

Cache Google Places API responses in the database to reduce API costs:

```sql
CREATE TABLE places_cache (
  place_id VARCHAR(255) PRIMARY KEY,
  data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for cleanup queries
CREATE INDEX idx_places_cache_expires ON places_cache(expires_at);

-- Scheduled cleanup of expired cache entries
SELECT cron.schedule(
  'cleanup-places-cache',
  '0 * * * *',  -- Every hour
  $$DELETE FROM places_cache WHERE expires_at < NOW()$$
);
```

### 9.3 React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Bookmark queries with optimistic updates
const useBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => supabase.from('bookmarks').select('*, tags(*)'),
  });
};
```

### 9.4 Cache Invalidation

- **Bookmark changes**: React Query invalidates via `queryClient.invalidateQueries(['bookmarks'])`
- **Realtime updates**: Supabase Realtime triggers re-fetch on remote changes
- **Google data**: TTL-based expiration in places_cache table

---

## 10. Security Architecture

### 10.1 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              HTTPS / TLS 1.3                        │     │
│  │         (Supabase managed certificates)            │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Supabase Auth (JWT)                         │     │
│  │    • Signature verification                        │     │
│  │    • Expiration checking                           │     │
│  │    • Automatic token refresh                       │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Row Level Security (RLS)                    │     │
│  │    • Database-enforced access control              │     │
│  │    • auth.uid() = user_id on every query           │     │
│  │    • Cannot be bypassed by application code        │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Edge Function Rate Limiting                 │     │
│  │    • Built-in limits per function                  │     │
│  │    • Custom limits via database tracking           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Data Protection

| Data | Protection Method |
|------|-------------------|
| User credentials | Managed by Supabase Auth (never stored by app) |
| Session tokens | Supabase manages securely |
| Google Maps API Key | Stored in Supabase secrets, used only in Edge Functions |
| Database | Encrypted at rest, SSL connections |
| OAuth tokens | Managed by Supabase Auth provider integration |

### 10.3 API Key Security

```typescript
// Edge Function - accessing secrets securely
Deno.serve(async (req) => {
  // API key stored in Supabase secrets, not exposed to client
  const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

  // Make request to Google Places API
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/...?key=${googleApiKey}`
  );

  return new Response(JSON.stringify(data));
});
```

### 10.4 Input Validation

- **Edge Functions**: Zod schemas for request validation
- **Database**: PostgreSQL constraints and check constraints
- **Client**: React Hook Form + Zod for form validation
- **SQL Injection**: Prevented by Supabase client parameterized queries
- **XSS**: Prevented by React's default escaping

### 10.5 RLS Best Practices

```sql
-- Always use auth.uid() for user identification
-- GOOD: Uses authenticated user's ID
CREATE POLICY "Users own bookmarks" ON bookmarks
  USING (auth.uid() = user_id);

-- BAD: Relying on application to pass user_id
-- (could be spoofed)

-- Service role bypasses RLS (use carefully)
-- Only use in Edge Functions for admin operations
const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY);
```

---

## 11. Deployment Architecture

### 11.1 Development Environment

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (Docker required)
supabase start

# Local services available:
# - API:      http://localhost:54321
# - Database: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio:   http://localhost:54323
# - Auth:     http://localhost:54321/auth/v1

# Run Edge Functions locally
supabase functions serve

# Apply migrations
supabase db push
```

**Local development setup:**
```
project/
├── src/                    # React frontend
├── supabase/
│   ├── functions/          # Edge Functions
│   ├── migrations/         # Database migrations
│   └── config.toml         # Local config
├── .env.local              # Local environment variables
└── package.json
```

### 11.2 Production Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Internet                                                           │
│       │                                                              │
│       ├─────────────────────────────────────────────────┐           │
│       │                                                 │           │
│       ▼                                                 ▼           │
│   ┌───────────────────────────────┐    ┌───────────────────────────┐│
│   │      Frontend Hosting         │    │        SUPABASE           ││
│   │      (Vercel/Netlify)         │    │    (Fully Managed)        ││
│   │                               │    │                           ││
│   │  • React SPA                  │    │  ┌─────────────────────┐  ││
│   │  • CDN distribution           │    │  │   Auth Service      │  ││
│   │  • Automatic HTTPS            │    │  │   (Google OAuth)    │  ││
│   │  • Edge caching               │    │  └─────────────────────┘  ││
│   │                               │    │                           ││
│   └───────────────────────────────┘    │  ┌─────────────────────┐  ││
│                                        │  │   PostgREST API     │  ││
│                                        │  │   (Auto-generated)  │  ││
│                                        │  └─────────────────────┘  ││
│                                        │                           ││
│                                        │  ┌─────────────────────┐  ││
│                                        │  │   Edge Functions    │  ││
│                                        │  │   (Deno Deploy)     │  ││
│                                        │  └─────────────────────┘  ││
│                                        │                           ││
│                                        │  ┌─────────────────────┐  ││
│                                        │  │   PostgreSQL        │  ││
│                                        │  │   (with RLS)        │  ││
│                                        │  └─────────────────────┘  ││
│                                        │                           ││
│                                        │  ┌─────────────────────┐  ││
│                                        │  │   Realtime          │  ││
│                                        │  │   (WebSockets)      │  ││
│                                        │  └─────────────────────┘  ││
│                                        │                           ││
│                                        └───────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.3 Environment Configuration

**Frontend (.env.local):**
```bash
# Supabase (public, safe to expose)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Google Maps (public, restricted by HTTP referrer)
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

**Supabase Secrets (Dashboard > Settings > Secrets):**
```bash
# Google Maps (private, used in Edge Functions)
GOOGLE_MAPS_API_KEY=AIza...

# Google OAuth (configured in Dashboard > Auth > Providers)
# - Client ID
# - Client Secret
# - Redirect URL: https://xxx.supabase.co/auth/v1/callback
```

### 11.4 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-supabase:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
      - run: supabase db push
      - run: supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## 12. Monitoring & Observability

### 12.1 Supabase Dashboard

Supabase provides built-in monitoring via the Dashboard:

| Feature | Location | Purpose |
|---------|----------|---------|
| **Database Health** | Dashboard > Database | Connection count, query performance |
| **API Logs** | Dashboard > Logs > API | PostgREST request logs |
| **Auth Logs** | Dashboard > Logs > Auth | Sign-in events, errors |
| **Edge Function Logs** | Dashboard > Logs > Functions | Function invocations, errors |
| **Realtime Inspector** | Dashboard > Realtime | Active subscriptions |
| **Storage Usage** | Dashboard > Storage | File storage metrics |

### 12.2 Edge Function Logging

```typescript
// supabase/functions/google-places-search/index.ts
Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    // ... function logic

    console.log(JSON.stringify({
      level: 'info',
      function: 'google-places-search',
      duration: Date.now() - startTime,
      userId: user?.id,
      query: searchQuery,
    }));

    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      function: 'google-places-search',
      error: error.message,
      stack: error.stack,
    }));

    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500 }
    );
  }
});
```

### 12.3 Frontend Error Tracking

```typescript
// Sentry integration for React
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 0.1,
});
```

### 12.4 Custom Metrics Table

Track application-specific metrics in the database:

```sql
CREATE TABLE app_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  labels JSONB DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Index for time-series queries
CREATE INDEX idx_metrics_name_time ON app_metrics(metric_name, recorded_at DESC);

-- Example: Track Google API calls
INSERT INTO app_metrics (metric_name, metric_value, labels)
VALUES ('google_api_calls', 1, '{"endpoint": "places_search"}');
```

### 12.5 Health Check Endpoint

```typescript
// supabase/functions/health/index.ts
Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Check database
  const { error: dbError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);

  // Check Google API
  let googleStatus = 'ok';
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=test&key=${Deno.env.get('GOOGLE_MAPS_API_KEY')}`
    );
    if (!res.ok) googleStatus = 'degraded';
  } catch {
    googleStatus = 'error';
  }

  return new Response(JSON.stringify({
    status: dbError ? 'unhealthy' : 'healthy',
    checks: {
      database: dbError ? 'error' : 'ok',
      google_api: googleStatus,
    },
    timestamp: new Date().toISOString(),
  }));
});
```

---

## 13. Error Handling

### 13.1 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid authentication |
| `AUTH_EXPIRED` | 401 | Token expired, refresh required |
| `FORBIDDEN` | 403 | Access denied to resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `GOOGLE_API_ERROR` | 502 | Google API failure |
| `SYNC_ERROR` | 500 | Sync operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 13.2 Error Recovery

- **Google API failures**: Retry with exponential backoff (3 attempts)
- **Sync failures**: Mark as error, retry on next scheduled sync
- **Database failures**: Return error, log for investigation

---

*Document Version: 2.0 (Supabase)*
*Last Updated: 2026-01-22*
