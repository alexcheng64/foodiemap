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
│   │  │   Google    │  │   React     │  │      Application        │  │     │
│   │  │  Maps SDK   │  │   Query     │  │       Components        │  │     │
│   │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                    │                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    Node.js API Server                            │     │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │     │
│   │  │   Auth      │  │  REST API   │  │    Google Maps          │  │     │
│   │  │  Middleware │  │  Routes     │  │    Proxy Service        │  │     │
│   │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                    │                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│    DATA LAYER        │  │  BACKGROUND      │  │   EXTERNAL SERVICES      │
├──────────────────────┤  │  SERVICES        │  ├──────────────────────────┤
│                      │  ├──────────────────┤  │                          │
│  ┌────────────────┐  │  │ ┌──────────────┐ │  │  ┌────────────────────┐  │
│  │  PostgreSQL    │  │  │ │ Sync Worker  │ │  │  │  Google OAuth 2.0  │  │
│  │                │  │  │ └──────────────┘ │  │  └────────────────────┘  │
│  └────────────────┘  │  │ ┌──────────────┐ │  │  ┌────────────────────┐  │
│  ┌────────────────┐  │  │ │ Job Queue    │ │  │  │  Google Places API │  │
│  │  Redis         │  │  │ │ (Bull)       │ │  │  └────────────────────┘  │
│  │  (Cache/Queue) │  │  │ └──────────────┘ │  │  ┌────────────────────┐  │
│  └────────────────┘  │  └──────────────────┘  │  │  Google Maps Lists │  │
│                      │                        │  └────────────────────┘  │
└──────────────────────┘                        └──────────────────────────┘
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

### 3.2 Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 20 LTS | JavaScript runtime |
| Framework | Fastify | High-performance web framework |
| Language | TypeScript 5 | Type-safe development |
| ORM | Prisma | Database access & migrations |
| Validation | Zod | Request/response validation |
| Authentication | Passport.js + Google OAuth | User authentication |
| Job Queue | Bull | Background job processing |
| Logging | Pino | Structured logging |

### 3.3 Data Storage

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary Database | PostgreSQL 16 | Relational data storage |
| Cache | Redis 7 | Session cache, rate limiting, job queue |
| File Storage | (Future) S3-compatible | User uploads if needed |

### 3.4 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Containerization | Docker | Application packaging |
| Orchestration | Docker Compose (dev) | Local development |
| Reverse Proxy | Nginx | SSL termination, static files |
| CI/CD | GitHub Actions | Automated testing & deployment |

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

### 4.2 Backend Components

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── strategies/
│   │   │   └── google.strategy.ts
│   │   └── guards/
│   │       └── jwt.guard.ts
│   ├── bookmarks/
│   │   ├── bookmark.controller.ts
│   │   ├── bookmark.service.ts
│   │   ├── bookmark.routes.ts
│   │   └── bookmark.schema.ts
│   ├── restaurants/
│   │   ├── restaurant.controller.ts
│   │   ├── restaurant.service.ts
│   │   ├── restaurant.routes.ts
│   │   └── google-places.client.ts
│   ├── tags/
│   │   ├── tag.controller.ts
│   │   ├── tag.service.ts
│   │   └── tag.routes.ts
│   └── sync/
│       ├── sync.controller.ts
│       ├── sync.service.ts
│       ├── sync.routes.ts
│       └── sync.worker.ts
├── common/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rateLimit.middleware.ts
│   ├── utils/
│   │   ├── encryption.ts
│   │   └── logger.ts
│   └── types/
│       └── index.ts
├── config/
│   ├── database.ts
│   ├── redis.ts
│   └── google.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── app.ts
```

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            users                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ UUID                                     │
│    │ google_id       │ VARCHAR(255) UNIQUE                      │
│    │ email           │ VARCHAR(255) UNIQUE                      │
│    │ display_name    │ VARCHAR(255)                             │
│    │ profile_picture │ TEXT                                     │
│    │ access_token    │ TEXT (encrypted)                         │
│    │ refresh_token   │ TEXT (encrypted)                         │
│    │ token_expires   │ TIMESTAMP                                │
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
│ FK │ user_id           │ UUID → users.id                        │
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
│ FK │ user_id         │ UUID → users.id                          │
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

---

## 6. API Design

### 6.1 RESTful Conventions

- Use plural nouns for resources (`/bookmarks`, `/tags`)
- Use HTTP methods semantically (GET, POST, PATCH, DELETE)
- Return appropriate status codes
- Use JSON for request/response bodies
- Include pagination for list endpoints

### 6.2 Request/Response Format

**Standard Success Response:**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

**Standard Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 6.3 API Endpoints Detail

#### Authentication
```
GET  /api/auth/google
     → Redirects to Google OAuth consent screen

GET  /api/auth/google/callback?code={code}
     → Handles OAuth callback, creates session
     ← Set-Cookie: session_token=...
     ← { data: { user: {...}, isNewUser: boolean } }

POST /api/auth/refresh
     → Refresh expired access token
     ← { data: { accessToken: string } }

POST /api/auth/logout
     → Invalidates session
     ← { data: { success: true } }

GET  /api/auth/me
     → Get current user profile
     ← { data: { user: {...} } }
```

#### Bookmarks
```
GET  /api/bookmarks?status={status}&tags={tagIds}&page={n}&limit={n}
     → List user's bookmarks with filters
     ← { data: [...], meta: { page, limit, total } }

POST /api/bookmarks
     → { googlePlaceId: string, note?: string, tags?: string[] }
     ← { data: { bookmark: {...} } }

GET  /api/bookmarks/:id
     → Get single bookmark
     ← { data: { bookmark: {...} } }

PATCH /api/bookmarks/:id
      → { note?, personalRating?, visitStatus?, visitedAt? }
      ← { data: { bookmark: {...} } }

DELETE /api/bookmarks/:id
       → Remove bookmark
       ← { data: { success: true } }

POST /api/bookmarks/:id/tags
     → { tagIds: string[] }
     ← { data: { bookmark: {...} } }

DELETE /api/bookmarks/:id/tags/:tagId
       → Remove tag from bookmark
       ← { data: { success: true } }
```

#### Restaurants (Google Places Proxy)
```
GET  /api/restaurants/search?query={q}&location={lat,lng}&radius={m}
     → Search restaurants via Places API
     ← { data: { restaurants: [...], nextPageToken?: string } }

GET  /api/restaurants/:placeId
     → Get restaurant details
     ← { data: { restaurant: {...} } }

GET  /api/restaurants/:placeId/photos?maxWidth={px}
     → Get photo URLs
     ← { data: { photos: [...] } }
```

#### Sync
```
GET  /api/sync/lists
     → Get user's Google Maps saved lists
     ← { data: { lists: [...] } }

POST /api/sync/connect
     → { googleListId: string, direction: 'two_way'|'to_google'|'from_google' }
     ← { data: { sync: {...} } }

POST /api/sync/trigger
     → Manually trigger sync
     ← { data: { jobId: string } }

GET  /api/sync/status
     → Get sync status
     ← { data: { status: 'idle'|'syncing', lastSyncedAt: string } }
```

---

## 7. Authentication Flow

### 7.1 Google OAuth 2.0 Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Server  │     │  Google  │     │   DB     │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ Click Login    │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │ Redirect to    │                │                │
     │ Google OAuth   │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │ Consent Screen │                │                │
     │───────────────────────────────▶│                │
     │                │                │                │
     │ Auth Code      │                │                │
     │◀───────────────────────────────│                │
     │                │                │                │
     │ Callback       │                │                │
     │ with code      │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │                │ Exchange code  │                │
     │                │ for tokens     │                │
     │                │───────────────▶│                │
     │                │                │                │
     │                │ Access Token + │                │
     │                │ Refresh Token  │                │
     │                │◀───────────────│                │
     │                │                │                │
     │                │ Get user info  │                │
     │                │───────────────▶│                │
     │                │                │                │
     │                │ User profile   │                │
     │                │◀───────────────│                │
     │                │                │                │
     │                │ Create/Update  │                │
     │                │ user record    │                │
     │                │───────────────────────────────▶│
     │                │                │                │
     │                │ Store tokens   │                │
     │                │ (encrypted)    │                │
     │                │───────────────────────────────▶│
     │                │                │                │
     │ Set session    │                │                │
     │ cookie + redirect               │                │
     │◀───────────────│                │                │
     │                │                │                │
```

### 7.2 Session Management

- **Session Token**: JWT stored in HTTP-only cookie
- **Token Expiry**: Access token 1 hour, refresh token 30 days
- **Refresh Strategy**: Auto-refresh when access token expires
- **Google Token Storage**: Encrypted with AES-256-GCM in database

---

## 8. Sync Service Architecture

### 8.1 Sync Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYNC TRIGGERS                                │
├─────────────────────────────────────────────────────────────────────┤
│  • User adds/removes bookmark                                        │
│  • Manual sync button                                                │
│  • Scheduled job (every 15 min)                                      │
│  • User login                                                        │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SYNC QUEUE (Bull)                            │
├─────────────────────────────────────────────────────────────────────┤
│  Job: { userId, syncType: 'full' | 'incremental', triggeredBy }     │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SYNC WORKER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Fetch local bookmarks (updated since last sync)                 │
│                          │                                           │
│                          ▼                                           │
│  2. Fetch Google Maps list items                                    │
│                          │                                           │
│                          ▼                                           │
│  3. Compare & Detect Changes                                        │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │  Local Only  │  Google Only  │  Both (compare timestamps) │   │
│     └──────┬───────┴───────┬───────┴──────────────┬───────────┘     │
│            │               │                      │                  │
│            ▼               ▼                      ▼                  │
│     Add to Google    Import to Local      Conflict Resolution       │
│                                                                      │
│  4. Execute sync operations                                         │
│                          │                                           │
│                          ▼                                           │
│  5. Update sync status & timestamps                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Conflict Resolution

| Scenario | Resolution Strategy |
|----------|---------------------|
| Added in both | Keep both, mark as synced |
| Deleted locally, exists in Google | Delete from Google (if two-way) |
| Deleted in Google, exists locally | Delete locally (if two-way) |
| Modified in both | Last-write-wins by timestamp |

### 8.3 Sync States

```
┌─────────┐     ┌──────────┐     ┌───────────┐
│  IDLE   │────▶│ SYNCING  │────▶│ COMPLETED │
└─────────┘     └────┬─────┘     └───────────┘
     ▲               │
     │               ▼
     │          ┌─────────┐
     └──────────│  ERROR  │
                └─────────┘
```

---

## 9. Caching Strategy

### 9.1 Cache Layers

| Layer | Technology | TTL | Purpose |
|-------|------------|-----|---------|
| Browser | React Query | 5 min | UI responsiveness |
| API | Redis | 15 min | Reduce DB load |
| Google Places | Redis | 24 hours | Reduce API costs |

### 9.2 Cache Keys

```
// User session
session:{sessionId}

// Restaurant details (from Google)
restaurant:{placeId}

// User's bookmark list (invalidate on change)
bookmarks:{userId}:list

// Search results
search:{query}:{location}:{radius}

// Rate limiting
ratelimit:{userId}:{endpoint}
```

### 9.3 Cache Invalidation

- **Bookmark changes**: Invalidate user's bookmark list cache
- **Tag changes**: Invalidate related bookmark caches
- **Google data**: TTL-based expiration (24 hours)

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
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Rate Limiting (Redis)                       │     │
│  │    • 100 req/min per user (authenticated)          │     │
│  │    • 20 req/min per IP (unauthenticated)           │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         JWT Validation                              │     │
│  │    • Verify signature                              │     │
│  │    • Check expiration                              │     │
│  │    • Validate claims                               │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Resource Authorization                      │     │
│  │    • User can only access own bookmarks/tags       │     │
│  │    • Ownership verified on every request           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Data Protection

| Data | Protection Method |
|------|-------------------|
| Google tokens | AES-256-GCM encryption at rest |
| Session tokens | HTTP-only, Secure, SameSite cookies |
| API keys | Environment variables, never in code |
| Database | Encrypted connections (SSL) |

### 10.3 Input Validation

- All inputs validated with Zod schemas
- SQL injection prevented by Prisma parameterized queries
- XSS prevented by React's default escaping
- CSRF protected by SameSite cookies

---

## 11. Deployment Architecture

### 11.1 Development Environment

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
```

### 11.2 Production Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Internet                                                           │
│       │                                                              │
│       ▼                                                              │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                    CDN (Static Assets)                     │     │
│   │                    (CloudFlare / Vercel)                   │     │
│   └───────────────────────────────────────────────────────────┘     │
│       │                                                              │
│       ▼                                                              │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                    Load Balancer                           │     │
│   └───────────────────────────────────────────────────────────┘     │
│       │                                                              │
│       ├──────────────────┬──────────────────┐                       │
│       ▼                  ▼                  ▼                        │
│   ┌────────┐        ┌────────┐        ┌────────┐                    │
│   │ API 1  │        │ API 2  │        │ API N  │   (Auto-scaling)   │
│   └────────┘        └────────┘        └────────┘                    │
│       │                  │                  │                        │
│       └──────────────────┼──────────────────┘                       │
│                          │                                           │
│       ┌──────────────────┼──────────────────┐                       │
│       ▼                  ▼                  ▼                        │
│   ┌────────┐        ┌────────┐        ┌────────┐                    │
│   │Postgres│        │ Redis  │        │ Worker │                    │
│   │Primary │        │Cluster │        │  Pool  │                    │
│   └────────┘        └────────┘        └────────┘                    │
│       │                                                              │
│       ▼                                                              │
│   ┌────────┐                                                        │
│   │Postgres│                                                        │
│   │Replica │                                                        │
│   └────────┘                                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.3 Environment Configuration

```bash
# Required Environment Variables

# Database
DATABASE_URL=postgresql://user:pass@host:5432/foodiemap

# Redis
REDIS_URL=redis://host:6379

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://app.foodiemap.com/api/auth/google/callback

# Google Maps
GOOGLE_MAPS_API_KEY=xxx

# Security
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx (32 bytes, base64)

# App
NODE_ENV=production
APP_URL=https://app.foodiemap.com
```

---

## 12. Monitoring & Observability

### 12.1 Logging

```typescript
// Structured logging with Pino
{
  "level": "info",
  "time": "2024-01-22T10:30:00.000Z",
  "requestId": "abc-123",
  "userId": "user-456",
  "method": "POST",
  "path": "/api/bookmarks",
  "statusCode": 201,
  "duration": 45
}
```

### 12.2 Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests by endpoint |
| `http_request_duration_ms` | Histogram | Request latency |
| `sync_jobs_total` | Counter | Sync jobs by status |
| `google_api_calls_total` | Counter | External API calls |
| `active_users` | Gauge | Currently active sessions |

### 12.3 Health Checks

```
GET /health
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "google_api": "ok"
  },
  "version": "1.0.0"
}
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

*Document Version: 1.0*
*Last Updated: 2026-01-22*
