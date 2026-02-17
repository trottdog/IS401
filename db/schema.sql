-- BYUConnect PostgreSQL schema
-- Run this first, then db/seed.sql. Backend (Drizzle) uses this same structure.

-- Users (login and profile)
CREATE TABLE IF NOT EXISTS users (
  id         VARCHAR(64) PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buildings (campus locations for events)
CREATE TABLE IF NOT EXISTS buildings (
  id           VARCHAR(64) PRIMARY KEY,
  name         TEXT NOT NULL,
  abbreviation VARCHAR(16) NOT NULL,
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  address      TEXT NOT NULL
);

-- Categories (for clubs and events)
CREATE TABLE IF NOT EXISTS categories (
  id   VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  icon VARCHAR(64) NOT NULL
);

-- Clubs
CREATE TABLE IF NOT EXISTS clubs (
  id           VARCHAR(64) PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  category_id  VARCHAR(64) NOT NULL REFERENCES categories(id),
  member_count INTEGER NOT NULL DEFAULT 0,
  image_color  VARCHAR(32) NOT NULL,
  contact_email TEXT NOT NULL,
  website      TEXT NOT NULL DEFAULT '',
  instagram    TEXT NOT NULL DEFAULT '',
  cover_image  TEXT
);

-- Club memberships
CREATE TABLE IF NOT EXISTS club_memberships (
  id        VARCHAR(64) PRIMARY KEY,
  user_id   VARCHAR(64) NOT NULL REFERENCES users(id),
  club_id   VARCHAR(64) NOT NULL REFERENCES clubs(id),
  role      VARCHAR(20) NOT NULL CHECK (role IN ('member', 'admin', 'president')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id                   VARCHAR(64) PRIMARY KEY,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  club_id              VARCHAR(64) NOT NULL REFERENCES clubs(id),
  building_id          VARCHAR(64) NOT NULL REFERENCES buildings(id),
  category_id          VARCHAR(64) NOT NULL REFERENCES categories(id),
  start_time           TIMESTAMPTZ NOT NULL,
  end_time             TIMESTAMPTZ NOT NULL,
  room                 TEXT NOT NULL,
  has_limited_capacity BOOLEAN NOT NULL DEFAULT FALSE,
  max_capacity         INTEGER,
  current_reservations INTEGER NOT NULL DEFAULT 0,
  has_food             BOOLEAN NOT NULL DEFAULT FALSE,
  food_description     TEXT,
  tags                 TEXT[] NOT NULL DEFAULT '{}',
  is_cancelled         BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image          TEXT
);

-- Saved events (user bookmarks)
CREATE TABLE IF NOT EXISTS event_saves (
  id       VARCHAR(64) PRIMARY KEY,
  user_id  VARCHAR(64) NOT NULL REFERENCES users(id),
  event_id VARCHAR(64) NOT NULL REFERENCES events(id),
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Event reservations
CREATE TABLE IF NOT EXISTS reservations (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    VARCHAR(64) NOT NULL REFERENCES users(id),
  event_id   VARCHAR(64) NOT NULL REFERENCES events(id),
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status     VARCHAR(20) NOT NULL CHECK (status IN ('confirmed', 'cancelled'))
);

-- Club announcements
CREATE TABLE IF NOT EXISTS announcements (
  id         VARCHAR(64) PRIMARY KEY,
  club_id    VARCHAR(64) NOT NULL REFERENCES clubs(id),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    VARCHAR(64) NOT NULL REFERENCES users(id),
  type       VARCHAR(50) NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  related_id VARCHAR(64)
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_building_id ON events(building_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_saves_user_id ON event_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_user_id ON club_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_club_id ON club_memberships(club_id);
