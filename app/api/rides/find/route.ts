import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import type { RideSearchRequest, RideSearchResult } from "@/types";

// POST /api/rides/find
// TODO (next step): implement the real matching query —
// $near on DriverRoutePoint for pickup AND destination, filtered by
// date + seatsAvailable, with a computed matchScore. This stub just
// proves the route + types + DB connection wire up correctly.
export async function POST(req: NextRequest) {
  await connectDb();

  const body: RideSearchRequest = await req.json();

  if (!body.pickup || !body.destination || !body.date) {
    return NextResponse.json(
      { success: false, message: "pickup, destination and date are required" },
      { status: 400 },
    );
  }

  const results: RideSearchResult[] = []; // TODO: real query

  return NextResponse.json({ success: true, rides: results });
}
