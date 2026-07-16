// Shared types — import these from BOTH your API routes and your components.
// This is what makes a "backend returns IDs, frontend expects objects" bug
// (like the one in the old app) show up as a red squiggle instead of a crash.

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface Ride {
  _id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;

  pickupInfo: Coords;
  destInfo: Coords;
  encodedPolyline?: string | null;

  vehicle: string;
  seats: number;
  seatsAvailable: number;

  date: string; // ISO date string
  time: string; // "HH:mm"

  pricingModel: "per_km";
  price: number;

  status: "active" | "full" | "completed" | "cancelled";

  createdAt?: string;
  updatedAt?: string;
}

// What /api/rides/find should return per ride — the old backend only
// returned driver ID strings; this is the shape the UI actually needs.
export interface RideSearchResult extends Ride {
  distanceToPickupKm: number;
  distanceToDestinationKm: number;
  matchScore: number; // 0-100
}

export interface Booking {
  _id: string;
  rideId: string;
  riderId: string;

  seatsBooked: number;

  pickupInfo: Coords;
  dropInfo: Coords;

  segmentDistanceKm: number;
  fare: number;

  status: "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";

  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
}

// Request body for POST /api/rides/find
export interface RideSearchRequest {
  pickup: Coords;
  destination: Coords;
  date: string; // ISO date string
  radiusMeters?: number; // default applied server-side
}
