# BYUconnect

## Overview

BYUconnect is a BYU-only campus events and clubs mobile application built with Expo (React Native) and TypeScript. It serves as a campus utility (not a social network) that helps students discover events happening on campus, browse and join clubs, and manage event reservations. The app follows a "time-first discovery" model where events are sorted by what's happening now or soonest upcoming. Events are always owned by clubs, not individuals. The app explicitly avoids social features like comments, likes, DMs, or follower counts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Mobile + Web)

- **Framework:** Expo SDK 54 with React Native, targeting iOS, Android, and Web
- **Language:** TypeScript with strict mode enabled
- **Navigation:** Expo Router (file-based routing) with typed routes enabled
- **State Management:** React Context (AuthProvider) + React Query (@tanstack/react-query) for server state, local component state with useState/useCallback
- **Fonts:** Inter font family via @expo-google-fonts/inter
- **Haptics:** expo-haptics for tactile feedback on interactions
- **Maps:** Custom MapViewWrapper using WebView with MapLibre GL JS (not react-native-maps) — separate implementations for native (`MapViewWrapper.tsx`) and web (`MapViewWrapper.web.tsx`)

### Route Structure

The app uses Expo Router's file-based routing:
- `app/(tabs)/` — Main tab navigation with 3 tabs: Discover, My Clubs, Profile
  - `app/(tabs)/(home)/` — Discover tab stack: index (map + event list), event/[id], club/[id], search
  - `app/(tabs)/(clubs)/` — My Clubs tab stack: index
  - `app/(tabs)/(profile)/` — Profile tab stack: index, notifications
- `app/(auth)/` — Modal auth flow with login and register screens
- Detail screens (event, club, search, notifications) are nested inside tab groups so the tab bar remains visible

### Data Layer (Current State)

- **Local Storage:** Currently uses AsyncStorage (`@react-native-async-storage/async-storage`) as the primary data store via `lib/store.ts`
- **Seed Data:** `lib/seed-data.ts` contains hardcoded BYU buildings, categories, clubs, and dynamically generated events
- **Data is initialized on first launch** and persisted locally — the app works fully offline with mock data
- **Types:** All data models defined in `lib/types.ts` (User, Building, Category, Club, Event, ClubMembership, EventSave, Reservation, Announcement, Notification)

### Backend Server

- **Framework:** Express 5 on Node.js
- **Location:** `server/` directory with `index.ts` (entry), `routes.ts` (API route registration), `storage.ts` (in-memory storage)
- **Current State:** The server is minimal — it mainly serves as a proxy during development and serves static web builds in production. The `routes.ts` file has placeholder structure for API routes prefixed with `/api`
- **CORS:** Configured to allow Replit domains and localhost origins
- **Build:** Server is bundled with esbuild for production (`server_dist/`)

### Database Schema (Prepared but not actively used)

- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema:** `shared/schema.ts` defines a basic `users` table with id, username, password
- **Validation:** drizzle-zod for schema-to-Zod validation
- **Config:** `drizzle.config.ts` expects `DATABASE_URL` environment variable
- **Migration:** Migrations output to `./migrations/` directory
- **Note:** The schema is minimal and doesn't yet reflect the full data model used in the frontend (events, clubs, buildings, etc.). The app currently runs entirely on AsyncStorage with seed data. When transitioning to a real backend, the schema needs to be expanded significantly.

### Storage Interface

`server/storage.ts` defines an `IStorage` interface with a `MemStorage` implementation. This is a clean abstraction point for swapping in database-backed storage (e.g., Drizzle + PostgreSQL).

### Design System

- **Color Palette:** BYU Navy (#002E5D), BYU Blue (#0062B8), BYU Accent (#0076CE) defined in `constants/colors.ts`
- **UI Style:** Instagram-minimal, clean, slate-based with subtle BYU color accents
- **Components:** Reusable components in `components/` — EventCard, ClubCard, SegmentedControl, MapViewWrapper, ErrorBoundary, KeyboardAwareScrollViewCompat

### Key Design Decisions

1. **AsyncStorage over backend DB (for now):** The app ships with a fully functional client-side data layer using seed data. This enables rapid prototyping without backend dependencies. The server and Drizzle schema are scaffolded for eventual migration.

2. **No social features:** By design — no comments, likes, DMs, follower counts. This is a campus utility, not a social network.

3. **Time-first event sorting:** Events are sorted by proximity to current time (happening now → soonest upcoming), not by popularity or distance.

4. **Clubs own events:** Events are always associated with a club (`clubId`). Individual users don't create events.

5. **Platform-specific components:** MapViewWrapper has separate native and web implementations. KeyboardAwareScrollView falls back to regular ScrollView on web.

## External Dependencies

### Services & APIs
- **MapTiler / MapLibre GL JS:** Used for map rendering via CDN-loaded scripts in WebView. Requires a MapTiler API key for tile styles.
- **Replit Environment:** The app is configured for Replit's development and deployment infrastructure, using environment variables like `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and `REPLIT_INTERNAL_APP_DOMAIN`.

### Database
- **PostgreSQL:** Configured via Drizzle but not yet actively used. Expects `DATABASE_URL` environment variable when database is provisioned.

### Key NPM Packages
- `expo` ~54.0.27 — Core framework
- `expo-router` ~6.0.17 — File-based routing
- `drizzle-orm` / `drizzle-kit` / `drizzle-zod` — ORM and validation (prepared for PostgreSQL)
- `@tanstack/react-query` — Server state management
- `express` ^5.0.1 — Backend HTTP server
- `pg` ^8.16.3 — PostgreSQL client
- `react-native-webview` — Used for map rendering
- `react-native-reanimated`, `react-native-gesture-handler` — Animations and gestures
- `expo-haptics` — Haptic feedback
- `@react-native-async-storage/async-storage` — Local data persistence
- `zod` — Runtime type validation