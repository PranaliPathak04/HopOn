# HopOn 🚗

A carpool ride-matching and booking platform — find someone already driving
your route, or offer your own ride and split the cost.

Built with Next.js (App Router), TypeScript, MongoDB, and a fully free,
open-source mapping stack (no Google Maps, no API keys, no billing account
required).

## Live features

- **Auth** — signup/login with hashed passwords, session handling via
  NextAuth (Credentials provider).
- **Publish a ride** — search for pickup/destination by address, see the
  actual road route on a live map, set seats/price/date/time.
- **Search for a ride** — real geospatial matching: checks proximity to your
  pickup **and** your destination, in the correct direction along the
  driver's route, not just "same city."
- **Book a seat** — atomic seat reservation (prevents two riders grabbing
  the last seat in a race condition), fare computed from actual distance,
  with cancellation support that restores seats.

## Stack

| Concern | Tool | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Route Handlers double as the backend — one app, one deploy |
| Language | TypeScript | Shared types between API routes and components catch data-shape mismatches at compile time |
| Database | MongoDB + Mongoose | Native geospatial (`2dsphere`) indexing for route matching |
| Auth | NextAuth.js | Session/JWT handling, no hand-rolled cookie logic |
| Styling | Tailwind CSS v4 | Custom design tokens (see `app/globals.css`) |
| Address search | [Nominatim](https://nominatim.org) | Free, OpenStreetMap-based geocoding, no API key |
| Routing | [OSRM](https://project-osrm.org) | Free, OpenStreetMap-based road routing, no API key |
| Map display | [MapLibre GL JS](https://maplibre.org) + [OpenFreeMap](https://openfreemap.org) | Free map tiles, no API key, no usage limits |

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up MongoDB Atlas (free M0 tier): create a cluster, a database user,
   and allow network access. Grab your connection string.

   > **Note:** if your network blocks DNS SRV lookups (some ISPs/routers
   > do), use the non-SRV connection string format instead of
   > `mongodb+srv://` — see `.env.example` for the shape.

3. Copy `.env.example` to `.env.local` and fill in:
   ```
   MONGODB_URI=...
   NEXTAUTH_SECRET=...   # generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Project structure

```
app/
  api/
    auth/
      signup/            → create account
      [...nextauth]/     → NextAuth handler (login/session)
    rides/
      publish/            → create a Ride + its DriverRoutePoint trail
      find/                → the matching algorithm
    bookings/
      create/              → atomic seat booking
      [id]/cancel/          → cancel + restore seats
  publish/                → driver: publish-a-ride page (map + form)
  search/                  → rider: search + results page
  login/, signup/           → auth pages
  page.tsx                  → homepage
components/
  LocationSearch.tsx        → debounced Nominatim address autocomplete
  RouteMap.tsx               → MapLibre + OpenFreeMap map display
  RideCard.tsx                → search result card (booking UI)
lib/
  db.ts                       → Mongoose connection (cached across hot reloads)
  geocode.ts                   → Nominatim + OSRM helpers
  geo.ts                        → Haversine distance
  authOptions.ts                 → NextAuth config
models/                          → Ride, Booking, User, DriverRoutePoint (Mongoose schemas)
types/index.ts                    → shared TypeScript contracts used by BOTH API routes and components
```

## How the matching algorithm works

1. **Pickup match** — `DriverRoutePoint.find()` with MongoDB's `$near` on a
   `2dsphere` index, filtered by date. Returns route points within a radius
   (default 2km) of the rider's pickup.
2. **Destination match** — for each candidate ride, check whether that same
   ride also has a route point near the rider's destination, at a **later**
   sequence number. This is what stops a driver heading the *opposite*
   direction from being matched just because they pass near the pickup.
3. **Filtering** — only rides with `seatsAvailable > 0` and
   `status: "active"` are returned.
4. **Scoring** — a 0–100 match score based on total distance (pickup +
   destination proximity), sorted best-first.

No external routing service is called at search time — matching is pure
MongoDB geo queries against pre-computed route points, so it stays fast
regardless of how the route was originally generated.

## Why shared types matter here

`types/index.ts` is imported by both the API route handlers and the React
components. This exists specifically to prevent frontend and backend from
silently disagreeing about data shape — a real bug in an earlier version of
this project, where the search endpoint returned bare ID strings but the UI
expected full ride objects with driver info, price, and distance fields.

## Roadmap

- [x] Auth (signup, login, session)
- [x] Publish-a-ride flow with live route map
- [x] Ride matching algorithm (geo-proximity + route-direction filtering)
- [x] Rider search UI
- [x] Booking flow (atomic seat reservation, cancellation)
- [ ] Draggable pin for precise pickup/drop-off (address search alone isn't
      always accurate for specific buildings)
- [ ] Driver identity verification (document upload + review flow) —
      `User.verificationStatus` field already exists, ready to gate on
- [ ] "My rides" / "My bookings" dashboard
- [ ] Dockerize
