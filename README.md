# BYUConnect

## App Summary

BYUConnect is a BYU-only campus events and clubs mobile application. It addresses the problem of discovering and keeping track of campus events and club activities in one place. The primary users are BYU students who want to see what events are happening on campus, which buildings they’re in, and which clubs are hosting them—without the noise of a social network. The product provides a time-first discovery experience (events happening now, then soonest upcoming), a map view of BYU buildings with event counts, and a list view of event cards. Users can save events, view club details, and manage their club memberships. The app is intentionally low-friction and non-social: no comments, likes, or DMs—just a campus utility for events and clubs.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Vite, React Router DOM, localStorage (in-browser data) |
| **Backend** | Node.js, Express 5, TypeScript, tsx (runtime) |
| **Database** | PostgreSQL, Drizzle ORM, Drizzle Kit (migrations/schema push) |
| **Authentication** | In-app login/register (stored in localStorage; backend users table ready for future API auth) |
| **External services** | MapTiler (map tiles for web map view) |

## Architecture Diagram

```mermaid
flowchart LR
    subgraph User
        U[User / Browser]
    end

    subgraph Frontend
        F[React App\nVite + TypeScript]
    end

    subgraph Backend
        API[Express API\nPort 5000]
    end

    subgraph Data
        DB[(PostgreSQL)]
    end

    subgraph External
        Map[MapTiler API\nmap tiles]
    end

    U <-->|"HTTPS"| F
    F -->|"REST API\n(events, saves)"| API
    API -->|"SQL\n(Drizzle)"| DB
    F -.->|"Map tiles\n(web map)"| Map
```

- **User ↔ Frontend:** User interacts with the React app in the browser at http://localhost:8080 (Vite dev server).
- **Frontend → Backend:** The frontend calls the Express API for events, clubs, buildings, categories, and saved events (e.g. Save/Unsave on Discover and Event Detail). Login remains in-app (localStorage) for now.
- **Backend → Database:** Express uses Drizzle ORM to read/write PostgreSQL. The database is created by running `db/schema.sql` and `db/seed.sql` (see Installation); the backend uses the same structure defined in `backend/schema.ts`.
- **Frontend → MapTiler:** The web map view (e.g. `/api/map` or in-app WebView) loads map tiles from MapTiler.

## Prerequisites

Install the following and ensure they are available in your system PATH:

| Software | Purpose | Install | Verify |
|----------|---------|--------|--------|
| **Node.js** (LTS, e.g. 20.x or 22.x) | Run frontend and backend | [nodejs.org](https://nodejs.org/) | `node --version` and `npm --version` |
| **PostgreSQL** | Database for backend | [PostgreSQL downloads](https://www.postgresql.org/download/) | `psql --version` |
| **npm** | Comes with Node.js | — | `npm --version` |

- **Node.js:** Use the LTS installer for your OS. After install, open a new terminal and run `node --version` and `npm --version`.
- **PostgreSQL:** Install the server and add the `bin` directory (e.g. `C:\Program Files\PostgreSQL\16\bin` on Windows) to PATH so `psql` works. Verify with `psql --version`.

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BYUConnect
   ```

2. **Install dependencies (frontend and backend)**
   ```bash
   npm run install:all
   ```
   Or install separately:
   ```bash
   npm run frontend:install
   npm run backend:install
   ```

3. **Create the database**
   - Create a PostgreSQL database (e.g. `byuconnect` or use your own name).
   - Example (with PostgreSQL installed and `psql` in PATH):
     ```bash
     psql -U postgres -c "CREATE DATABASE byuconnect;"
     ```

4. **Configure environment variables**
   Create both files below (copy each block and save to the path shown). Replace `postgres`, `password`, and `byuconnect` with your PostgreSQL username, password, and database name.

   **Backend — save as `backend/.env`:**
     ```env
     # PostgreSQL connection string (required for DB APIs).
     # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
     DATABASE_URL=postgresql://postgres:password@localhost:5432/byuconnect

     # Optional. Port for the API server (default: 5000).
     PORT=5000
     ```

   **Project root — save as `.env` (optional; for frontend API URL / MapTiler):**
     ```env
     # Optional. Backend API base URL (default: http://localhost:5000).
     # VITE_API_URL=http://localhost:5000

     # Optional. MapTiler API key for map styles (leave unset to use free demo tiles).
     # VITE_MAPTILER_KEY=your_maptiler_key
     ```

5. **Create tables and load sample data**
   - From the project root, run the SQL scripts in order (use your database name and user if different):
     ```bash
     psql -U postgres -d byuconnect -f db/schema.sql
     psql -U postgres -d byuconnect -f db/seed.sql
     ```
   - **What this does:** `db/schema.sql` creates all tables (users, buildings, categories, clubs, club_memberships, events, event_saves, reservations, announcements, notifications—10 tables matching the app ERD). `db/seed.sql` inserts sample rows into every table so you can run the app and test the Save button. The backend uses the same structure via Drizzle (`backend/schema.ts`).

6. **Recreating the database from scratch**
   - To drop and recreate the database and reload schema and seed data:
     ```bash
     psql -U postgres -c "DROP DATABASE IF EXISTS byuconnect;"
     psql -U postgres -c "CREATE DATABASE byuconnect;"
     psql -U postgres -d byuconnect -f db/schema.sql
     psql -U postgres -d byuconnect -f db/seed.sql
     ```
   - Then ensure `backend/.env` has `DATABASE_URL` pointing at `byuconnect`.

## Running the Application

1. **Start the backend** (from project root)
   ```bash
   npm run backend
   ```
   - Backend runs at **http://localhost:5000**.
   - You can confirm it with: http://localhost:5000/api/health (should return `{"ok":true}`).

2. **Start the frontend** (from project root)
   ```bash
   npm run frontend
   ```
   - Frontend runs at **http://localhost:8080**. Open this URL in your browser.

3. **Use the app**
   - In the browser, open **http://localhost:8080**.
   - Use **Discover**, **My Clubs**, and **Profile**. Sign in or register; the **Save** (star) button on events writes to the database via the backend API. You stay signed in until you tap **Sign Out** (session survives refresh and closing the browser).

4. **Sign in with the seed account (for testing)**
   - Go to **Profile** (or any tab) and tap **Sign In**, or open **http://localhost:8080/login**.
   - Use this pre-seeded account:
     - **Email:** `student@byu.edu`
     - **Password:** `password123`
   - This account (Alex Johnson) exists in the database after you run `db/seed.sql`; saved events are stored in the `event_saves` table when you use the Save button.

**If the frontend won’t start:** Ensure port **8080** is free, or run `cd frontend && npm run dev` and use the URL shown in the terminal.

## Verifying the Vertical Slice

This section demonstrates the **Save event** flow: one button that triggers the backend, updates the database, returns the updated value, shows it in the UI, and persists after refresh. **Success:** you see the star turn filled, a new row in `event_saves`, and the star still filled after reloading the page.

1. **Trigger the feature**
   - Start the backend and frontend (see **Running the Application**). Open **http://localhost:8080** in your browser.
   - **Sign in** with the seed account: **Email** `student@byu.edu`, **Password** `password123`.
   - Go to **Discover** and ensure **List** view is selected. Find an event and click the **star (☆)** next to it to **Save** the event. The star should turn filled **(★)** and the UI should update immediately (the backend returns the new save and the frontend shows it).

2. **Confirm the database was updated**
   - In a terminal, query the `event_saves` table (use your DB name and user if different):
     ```bash
     psql -U postgres -d byuconnect -c "SELECT * FROM event_saves;"
     ```
   - You should see a row with the signed-in user’s `user_id`, the event’s `event_id`, and a `saved_at` timestamp.

3. **Verify persistence after refresh**
   - Refresh the page (F5 or Ctrl+R). You remain signed in. Go to **Discover** and confirm the same event still shows as **saved** (filled star ★). The saved state is loaded from the database on page load, so the change is persistent.
