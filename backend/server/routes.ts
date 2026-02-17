import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "node:url";
import { and, eq, gt } from "drizzle-orm";
import { getDatabase, schema } from "../db.js";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, db: hasDb() });
  });

  app.get("/api/map", (_req, res) => {
    const mapPath = path.join(__dirname, "templates", "map.html");
    const html = fs.readFileSync(mapPath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  if (hasDb()) {
    const db = getDatabase();

    app.get("/api/events", async (_req, res) => {
      try {
        const now = new Date();
        const rows = await db
          .select()
          .from(schema.events)
          .where(and(gt(schema.events.endTime, now), eq(schema.events.isCancelled, false)));
        res.json(rows.map((r) => ({ ...r, isCancelled: r.isCancelled ?? false })));
      } catch (e) {
        console.error("GET /api/events", e);
        res.status(500).json({ error: "Failed to fetch events" });
      }
    });

    app.get("/api/clubs", async (_req, res) => {
      try {
        const rows = await db.select().from(schema.clubs);
        res.json(rows);
      } catch (e) {
        console.error("GET /api/clubs", e);
        res.status(500).json({ error: "Failed to fetch clubs" });
      }
    });

    app.get("/api/buildings", async (_req, res) => {
      try {
        const rows = await db.select().from(schema.buildings);
        res.json(rows);
      } catch (e) {
        console.error("GET /api/buildings", e);
        res.status(500).json({ error: "Failed to fetch buildings" });
      }
    });

    app.get("/api/categories", async (_req, res) => {
      try {
        const rows = await db.select().from(schema.categories);
        res.json(rows);
      } catch (e) {
        console.error("GET /api/categories", e);
        res.status(500).json({ error: "Failed to fetch categories" });
      }
    });

    app.get("/api/saves", async (req, res) => {
      try {
        const userId = req.query.userId as string;
        if (!userId) {
          res.status(400).json({ error: "userId query required" });
          return;
        }
        const rows = await db.select().from(schema.eventSaves).where(eq(schema.eventSaves.userId, userId));
        res.json(rows.map((r) => ({ id: r.id, userId: r.userId, eventId: r.eventId, savedAt: r.savedAt?.toISOString() ?? new Date().toISOString() })));
      } catch (e) {
        console.error("GET /api/saves", e);
        res.status(500).json({ error: "Failed to fetch saves" });
      }
    });

    app.post("/api/saves", async (req, res) => {
      try {
        const { userId, eventId } = req.body as { userId?: string; eventId?: string };
        if (!userId || !eventId) {
          res.status(400).json({ error: "userId and eventId required" });
          return;
        }
        const id = randomUUID();
        const savedAt = new Date();
        await db.insert(schema.eventSaves).values({ id, userId, eventId, savedAt });
        res.status(201).json({ id, userId, eventId, savedAt: savedAt.toISOString() });
      } catch (e) {
        console.error("POST /api/saves", e);
        res.status(500).json({ error: "Failed to save event" });
      }
    });

    app.delete("/api/saves", async (req, res) => {
      try {
        const userId = (req.body?.userId ?? req.query.userId) as string | undefined;
        const eventId = (req.body?.eventId ?? req.query.eventId) as string | undefined;
        if (!userId || !eventId) {
          res.status(400).json({ error: "userId and eventId required" });
          return;
        }
        await db.delete(schema.eventSaves).where(and(eq(schema.eventSaves.userId, userId), eq(schema.eventSaves.eventId, eventId)));
        res.json({ deleted: true });
      } catch (e) {
        console.error("DELETE /api/saves", e);
        res.status(500).json({ error: "Failed to unsave event" });
      }
    });
  }

  return createServer(app);
}
