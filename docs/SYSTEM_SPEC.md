# FoodieMap - System Specification

## 1. Overview

FoodieMap is a web application that allows users to bookmark and organize restaurants discovered through Google Maps. Users can save restaurants, categorize them with custom tags, add personal notes, and view their bookmarked locations on an interactive map.

**Key Integration:** Bookmarked restaurants are synchronized with the user's Google Maps saved lists, ensuring their favorites are accessible both in FoodieMap and the native Google Maps app.

---

## 2. Core Features

### 2.1 Restaurant Search & Discovery
- Search restaurants by name, location, or cuisine type using Google Maps/Places API
- View restaurant details including name, address, phone, hours, photos, and ratings
- Display search results on an interactive map

### 2.2 Bookmarking
- Save restaurants to personal bookmark collection
- Remove bookmarks
- View all bookmarked restaurants in list or map view

### 2.3 Organization
- Create custom tags/categories (e.g., "Date Night", "Cheap Eats", "Must Try")
- Assign multiple tags to each bookmark
- Filter bookmarks by tags
- Add personal notes to bookmarked restaurants

### 2.4 User Ratings & Status
- Mark restaurants with personal visit status: "Want to Visit", "Visited"
- Add personal rating (1-5 stars) after visiting
- Add visit date

### 2.5 Map View
- Display all bookmarked restaurants on a single map
- Filter map markers by tags or status
- Click markers to view restaurant details

### 2.6 Google Maps List Sync
- Connect to user's Google account via OAuth
- Create a dedicated "FoodieMap" list in user's Google Maps saved places
- Two-way synchronization:
  - Adding a bookmark in FoodieMap → adds to Google Maps list
  - Removing a bookmark in FoodieMap → removes from Google Maps list
  - Import existing places from user's Google Maps lists
- Sync status indicator showing last sync time
- Manual sync trigger option
- Conflict resolution for changes made in both systems

---

## 3. Data Sources

### 3.1 Google Maps Platform APIs

| API | Purpose |
|-----|---------|
| Places API (New) | Search restaurants, get place details, photos |
| Maps JavaScript API | Interactive map display |
| Geocoding API | Convert addresses to coordinates |

### 3.2 Data Retrieved from Google

- Place ID (unique identifier)
- Restaurant name
- Address / Location coordinates
- Phone number
- Website URL
- Opening hours
- Google rating (1-5) and review count
- Price level (1-4)
- Photos (references)
- Place types/categories

---

## 4. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-01 | User | Search for restaurants by name or location | I can find places to bookmark |
| US-02 | User | View restaurant details from Google Maps | I can decide if I want to save it |
| US-03 | User | Bookmark a restaurant | I can remember it for later |
| US-04 | User | Add tags to my bookmarks | I can organize my saved places |
| US-05 | User | Add personal notes to a bookmark | I can remember why I saved it |
| US-06 | User | Mark a restaurant as visited | I can track where I've been |
| US-07 | User | Add my own rating after visiting | I can remember my experience |
| US-08 | User | View all my bookmarks on a map | I can see locations visually |
| US-09 | User | Filter bookmarks by tag | I can find specific types of places |
| US-10 | User | Delete a bookmark | I can remove places I'm no longer interested in |
| US-11 | User | Sign in with my Google account | My bookmarks sync with Google Maps |
| US-12 | User | Log in/out | I can access my personal data securely |
| US-13 | User | See my bookmarks in Google Maps app | I can access saved places on mobile |
| US-14 | User | Import existing Google Maps saved places | I can bring in places I already saved |
| US-15 | User | Choose which Google Maps list to sync with | I can organize my saved places |

---

## 5. Data Models

### 5.1 User Profile
```
-- Extends Supabase auth.users table
profiles {
  id: UUID (PK, FK -> auth.users.id)
  display_name: String
  avatar_url: String (nullable)
  created_at: Timestamp
  updated_at: Timestamp
}
```

**Note:** User authentication data (email, Google ID, tokens) is managed by Supabase Auth in the `auth.users` table. The `profiles` table stores app-specific user data.

### 5.2 GoogleMapsListSync
```
GoogleMapsListSync {
  id: UUID (PK)
  user_id: UUID (FK -> User)
  google_list_id: String
  google_list_name: String
  sync_direction: Enum ['two_way', 'to_google', 'from_google']
  last_synced_at: Timestamp (nullable)
  sync_status: Enum ['idle', 'syncing', 'error']
  error_message: String (nullable)
  created_at: Timestamp
  updated_at: Timestamp
}
```

### 5.3 Bookmark
```
Bookmark {
  id: UUID (PK)
  user_id: UUID (FK -> User)
  google_place_id: String
  restaurant_name: String
  address: String
  latitude: Decimal
  longitude: Decimal
  google_rating: Decimal (nullable)
  google_rating_count: Integer (nullable)
  price_level: Integer (nullable, 1-4)
  phone: String (nullable)
  website: String (nullable)
  photo_reference: String (nullable)
  personal_note: Text (nullable)
  personal_rating: Integer (nullable, 1-5)
  visit_status: Enum ['want_to_visit', 'visited']
  visited_at: Date (nullable)
  created_at: Timestamp
  updated_at: Timestamp

  UNIQUE(user_id, google_place_id)
}
```

### 5.4 Tag
```
Tag {
  id: UUID (PK)
  user_id: UUID (FK -> User)
  name: String
  color: String (hex color code)
  created_at: Timestamp

  UNIQUE(user_id, name)
}
```

### 5.5 BookmarkTag (Junction Table)
```
BookmarkTag {
  bookmark_id: UUID (FK -> Bookmark)
  tag_id: UUID (FK -> Tag)

  PRIMARY KEY(bookmark_id, tag_id)
}
```

---

## 6. API Endpoints

### 6.1 Authentication (Supabase Auth)

Authentication is handled entirely by Supabase Auth client library. No custom API endpoints needed.

| Client Method | Description |
|---------------|-------------|
| `supabase.auth.signInWithOAuth({ provider: 'google' })` | Initiate Google OAuth flow |
| `supabase.auth.signOut()` | End user session |
| `supabase.auth.getUser()` | Get current user info |
| `supabase.auth.onAuthStateChange()` | Listen for auth state changes |

**Note:** Supabase handles OAuth redirects, token refresh, and session management automatically.

### 6.2 Restaurants (Google Maps Proxy)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/search` | Search restaurants (query, location) |
| GET | `/api/restaurants/:placeId` | Get restaurant details |
| GET | `/api/restaurants/:placeId/photos` | Get restaurant photos |

### 6.3 Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookmarks` | List user's bookmarks (with filters) |
| POST | `/api/bookmarks` | Create new bookmark |
| GET | `/api/bookmarks/:id` | Get bookmark details |
| PATCH | `/api/bookmarks/:id` | Update bookmark (notes, rating, status) |
| DELETE | `/api/bookmarks/:id` | Delete bookmark |
| POST | `/api/bookmarks/:id/tags` | Add tags to bookmark |
| DELETE | `/api/bookmarks/:id/tags/:tagId` | Remove tag from bookmark |

### 6.4 Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | List user's tags |
| POST | `/api/tags` | Create new tag |
| PATCH | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Delete tag |

### 6.5 Google Maps Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sync/lists` | Get user's Google Maps saved lists |
| POST | `/api/sync/connect` | Connect a Google Maps list for sync |
| DELETE | `/api/sync/disconnect` | Disconnect sync for a list |
| POST | `/api/sync/trigger` | Manually trigger sync |
| GET | `/api/sync/status` | Get current sync status |
| POST | `/api/sync/import` | Import places from a Google Maps list |

---

## 7. Technical Architecture

### 7.1 Tech Stack (Recommended)

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- React Query for server state management
- Google Maps JavaScript API
- Supabase JavaScript Client (`@supabase/supabase-js`)

**Backend (Supabase):**
- Supabase PostgreSQL database
- Supabase Auth (Google OAuth provider)
- PostgREST (auto-generated REST API)
- Supabase Edge Functions (Deno) for custom logic
- Supabase Realtime for live updates

**Authentication:**
- Supabase Auth with Google OAuth provider
- JWT tokens managed by Supabase
- Row Level Security (RLS) for authorization

**Infrastructure:**
- Supabase (fully managed backend)
- Vercel or Netlify (frontend hosting)
- GitHub Actions (CI/CD)

### 7.2 Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         React SPA                                │
│            (TypeScript + Supabase Client)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Auth      │  │  Database   │  │    Edge Functions       │  │
│  │  (Google    │  │ (PostgreSQL │  │  • Google Maps Proxy    │  │
│  │   OAuth)    │  │  + RLS)     │  │  • Sync Service         │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
│                                                │                 │
│  ┌─────────────┐  ┌─────────────┐              │                 │
│  │  Realtime   │  │   Storage   │              │                 │
│  │ (Live sync) │  │  (Photos)   │              │                 │
│  └─────────────┘  └─────────────┘              │                 │
└────────────────────────────────────────────────┼─────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Maps Platform                          │
│  (Places API, Maps JavaScript API, OAuth 2.0, Saved Lists API)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. UI/UX Wireframes (Conceptual)

### 8.1 Main Pages

1. **Home / Map View**
   - Full-screen map with bookmark markers
   - Sidebar with bookmark list
   - Search bar at top
   - Filter controls

2. **Search Results**
   - List of restaurants from search
   - Mini-map showing results
   - Quick bookmark button on each result

3. **Restaurant Detail Modal**
   - Restaurant info from Google
   - Bookmark controls (save/unsave)
   - Tag selector
   - Notes input
   - Personal rating input
   - Visit status toggle

4. **My Bookmarks (List View)**
   - Filterable/sortable list
   - Tag filter chips
   - Status filter (All / Want to Visit / Visited)

5. **Tag Management**
   - List of user's tags
   - Create/edit/delete tags
   - Color picker

6. **Sync Settings**
   - Connected Google account display
   - Select Google Maps list to sync
   - Sync status and last sync time
   - Manual sync button
   - Import from existing Google Maps lists
   - Sync direction preference

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Search results should load within 2 seconds
- Map should render smoothly with up to 500 markers
- API responses should be < 500ms for CRUD operations

### 9.2 Security
- All API endpoints (except auth) require authentication
- Google OAuth tokens encrypted at rest (AES-256)
- Input validation on all endpoints
- Rate limiting on API endpoints
- HTTPS required in production
- CSRF protection on OAuth callback
- Secure token refresh handling

### 9.3 Scalability
- Database indexing on frequently queried fields
- Pagination for bookmark lists (20 items default)
- Lazy loading for images

### 9.4 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## 10. Google Account Integration

### 10.1 OAuth 2.0 Configuration

**Required Scopes:**
```
openid
email
profile
https://www.googleapis.com/auth/maps.savedlists
```

**OAuth Flow:**
1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. User grants permissions for profile + saved lists access
4. Callback receives authorization code
5. Exchange code for access + refresh tokens
6. Store tokens securely (encrypted in database)
7. Create/update user record

### 10.2 Google Maps Saved Lists API

**Note:** Google Maps saved places functionality is accessed through the Maps Data API. The sync mechanism interacts with user's saved lists.

**API Availability Note:**
The Google Maps Saved Lists API has limited public availability. Implementation options:
1. **Official API** (if available): Use Google's official endpoints
2. **Alternative approach**: Use Google My Maps API to create custom maps
3. **Fallback**: One-way sync (export to KML/Google My Maps)

Verify current API availability during implementation phase.

**Supported Operations:**
- List user's saved lists
- Get places in a specific list
- Add place to a list
- Remove place from a list
- Create new list

### 10.3 Sync Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Sync Service                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Webhook/   │    │    Sync      │    │   Conflict   │  │
│  │   Polling    │───▶│   Engine     │───▶│   Resolver   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Sync Queue                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                                   ▼
    ┌─────────────┐                     ┌─────────────┐
    │  FoodieMap  │                     │   Google    │
    │  Database   │                     │  Maps API   │
    └─────────────┘                     └─────────────┘
```

**Sync Triggers:**
- User adds/removes bookmark in FoodieMap
- Periodic background sync (every 15 minutes)
- Manual sync button
- On user login

**Conflict Resolution Strategy:**
- Last-write-wins based on timestamp
- User can configure preference (FoodieMap priority vs Google priority)
- Deletions are soft-deleted locally, confirmed on next sync

### 10.4 Sync Data Mapping

| FoodieMap Field | Google Maps | Sync Direction |
|-----------------|-------------|----------------|
| google_place_id | Place ID | Bidirectional |
| restaurant_name | Place name | From Google |
| visit_status | (not available) | FoodieMap only |
| personal_note | (not available) | FoodieMap only |
| personal_rating | (not available) | FoodieMap only |
| tags | (not available) | FoodieMap only |

---

## 11. Google Maps API Considerations

### 11.1 API Key Security
- Restrict API key by HTTP referrer (frontend)
- Use separate key for backend with IP restrictions
- Never expose backend API key to client

### 11.2 Billing
- Places API: charged per request
- Implement caching for place details
- Cache photo URLs (references valid for a few days)
- Consider storing basic place data in DB to reduce API calls

### 11.3 Rate Limits
- Implement request queuing/throttling
- Handle quota exceeded errors gracefully

---

## 12. Future Enhancements (Out of Scope for V1)

- Share bookmarks with other users
- Collaborative lists
- Import/export bookmarks
- Mobile app (React Native)
- Social features (follow users, public profiles)
- Restaurant recommendations based on bookmarks
- Integration with reservation systems

---

## 13. Glossary

| Term | Definition |
|------|------------|
| Bookmark | A saved restaurant in user's collection |
| Place ID | Google's unique identifier for a location |
| Tag | User-created category for organizing bookmarks |
| Visit Status | Whether user has visited or wants to visit |
| Saved List | A Google Maps list where users save places |
| Sync | Process of keeping FoodieMap and Google Maps data consistent |
| OAuth | Authorization protocol for Google account access |
| Supabase | Backend-as-a-Service platform providing database, auth, and APIs |
| RLS | Row Level Security - database-level access control in PostgreSQL |
| Edge Functions | Serverless functions running on Supabase's edge network |
| PostgREST | Auto-generated REST API from PostgreSQL schema |

---

*Document Version: 2.0 (Supabase)*
*Last Updated: 2026-01-22*
