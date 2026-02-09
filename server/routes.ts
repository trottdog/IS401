import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as path from "path";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/map", (_req, res) => {
    const mapPath = path.resolve(process.cwd(), "server", "templates", "map.html");
    const html = fs.readFileSync(mapPath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  const httpServer = createServer(app);

  return httpServer;
}
