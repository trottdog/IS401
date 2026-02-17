import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

const app = express();
const log = console.log;

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    if (origin && isLocalhost) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as { status?: number; statusCode?: number; message?: string };
    const status = error.status ?? error.statusCode ?? 500;
    const message = error.message ?? "Internal Server Error";
    console.error("Error:", err);
    if (!res.headersSent) res.status(status).json({ message });
    else next(err);
  });
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);

  const server = await registerRoutes(app);
  setupErrorHandler(app);

  const port = parseInt(process.env.PORT ?? "5000", 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`BYUConnect API listening on port ${port}`);
  });
})();
