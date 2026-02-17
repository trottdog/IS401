/**
 * Drizzle schema matching db/schema.sql.
 * Run db/schema.sql and db/seed.psql to create and seed the database.
 * This file is used by drizzle-kit and the app to connect via the same schema.
 */
import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const buildings = pgTable("buildings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  abbreviation: varchar("abbreviation", { length: 16 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  icon: varchar("icon", { length: 64 }).notNull(),
});

export const clubs = pgTable("clubs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id", { length: 64 }).notNull().references(() => categories.id),
  memberCount: integer("member_count").notNull().default(0),
  imageColor: varchar("image_color", { length: 32 }).notNull(),
  contactEmail: text("contact_email").notNull(),
  website: text("website").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  coverImage: text("cover_image"),
});

export const clubMemberships = pgTable(
  "club_memberships",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
    clubId: varchar("club_id", { length: 64 }).notNull().references(() => clubs.id),
    role: varchar("role", { length: 20 }).notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("club_memberships_user_club").on(t.userId, t.clubId)]
);

export const events = pgTable("events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clubId: varchar("club_id", { length: 64 }).notNull().references(() => clubs.id),
  buildingId: varchar("building_id", { length: 64 }).notNull().references(() => buildings.id),
  categoryId: varchar("category_id", { length: 64 }).notNull().references(() => categories.id),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  room: text("room").notNull(),
  hasLimitedCapacity: boolean("has_limited_capacity").notNull().default(false),
  maxCapacity: integer("max_capacity"),
  currentReservations: integer("current_reservations").notNull().default(0),
  hasFood: boolean("has_food").notNull().default(false),
  foodDescription: text("food_description"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  coverImage: text("cover_image"),
});

export const eventSaves = pgTable(
  "event_saves",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
    eventId: varchar("event_id", { length: 64 }).notNull().references(() => events.id),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("event_saves_user_event").on(t.userId, t.eventId)]
);

export const reservations = pgTable("reservations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
  eventId: varchar("event_id", { length: 64 }).notNull().references(() => events.id),
  reservedAt: timestamp("reserved_at", { withTimezone: true }).notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clubId: varchar("club_id", { length: 64 }).notNull().references(() => clubs.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  relatedId: varchar("related_id", { length: 64 }),
});
