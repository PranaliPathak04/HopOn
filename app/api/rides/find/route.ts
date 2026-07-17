import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { haversineDistanceKm } from "@/lib/geo";
import DriverRoutePoint from "@/models/DriverRoutePoint";
import Ride from "@/models/Ride";
import type { RideSearchRequest, RideSearchResult } from "@/types";

const DEFAULT_RADIUS_METERS = 2000; // how close a route point must be to count as a match

// POST /api/rides/find
//
// Algorithm:
// 1. Find DriverRoutePoints near the rider's pickup, on the requested date,
//    using MongoDB's $near on the 2dsphere index (not looping in JS).
// 2. For each candidate ride found in step 1, check whether that SAME ride
//    also has a route point near the rider's destination, at a LATER
//    sequence number. This is what stops us matching a driver who passes
//    near the pickup but is headed the opposite direction.
// 3. Pull the matching Ride documents; keep only ones with seats available
//    and status "active".
// 4. Score by total distance (pickup + destination), sort best-first.
export async function POST(req: NextRequest) {
  await connectDb();

  const body: RideSearchRequest = await req.json();
  const { pickup, destination, date } = body;
  const radiusMeters = body.radiusMeters ?? DEFAULT_RADIUS_METERS;

  if (!pickup || !destination || !date) {
    return NextResponse.json(
      { success: false, message: "pickup, destination and date are required" },
      { status: 400 },
    );
  }

  const dateStr = new Date(date).toISOString().slice(0, 10); // 'YYYY-MM-DD'

  // Step 1: route points near pickup, on this date
  const pickupMatches = await DriverRoutePoint.find({
    date: dateStr,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [pickup.longitude, pickup.latitude],
        },
        $maxDistance: radiusMeters,
      },
    },
  }).lean();

  if (pickupMatches.length === 0) {
    return NextResponse.json({ success: true, rides: [] });
  }

  // Keep the closest pickup match per ride (a ride may have several nearby points)
  const bestPickupByRide = new Map<
    string,
    { sequence: number; distanceKm: number }
  >();
  for (const p of pickupMatches) {
    const rideId = p.rideId.toString();
    const d = haversineDistanceKm(
      pickup.latitude,
      pickup.longitude,
      p.location.coordinates[1],
      p.location.coordinates[0],
    );
    const existing = bestPickupByRide.get(rideId);
    if (!existing || d < existing.distanceKm) {
      bestPickupByRide.set(rideId, { sequence: p.sequence, distanceKm: d });
    }
  }

  // Step 2: for each candidate ride, check for a destination match LATER in the route
  const candidates: {
    rideId: string;
    distanceToPickupKm: number;
    distanceToDestinationKm: number;
  }[] = [];

  for (const [rideId, pickupMatch] of bestPickupByRide.entries()) {
    const destMatches = await DriverRoutePoint.find({
      rideId,
      date: dateStr,
      sequence: { $gt: pickupMatch.sequence },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [destination.longitude, destination.latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
    })
      .limit(1)
      .lean();

    if (destMatches.length === 0) continue;

    const destPoint = destMatches[0];
    const distanceToDestinationKm = haversineDistanceKm(
      destination.latitude,
      destination.longitude,
      destPoint.location.coordinates[1],
      destPoint.location.coordinates[0],
    );

    candidates.push({
      rideId,
      distanceToPickupKm: pickupMatch.distanceKm,
      distanceToDestinationKm,
    });
  }

  if (candidates.length === 0) {
    return NextResponse.json({ success: true, rides: [] });
  }

  // Step 3: pull the actual Ride documents, filter seats + status + date
  const rideIds = candidates.map((c) => c.rideId);
  const rides = await Ride.find({
    _id: { $in: rideIds },
    seatsAvailable: { $gt: 0 },
    status: "active",
  }).lean();

  const rideById = new Map(rides.map((r) => [r._id.toString(), r]));

  // Step 4: build results with a match score (lower = better) and sort
  const results: RideSearchResult[] = candidates
    .filter((c) => rideById.has(c.rideId))
    .map((c) => {
      const ride = rideById.get(c.rideId)!;
      const totalDistanceKm = c.distanceToPickupKm + c.distanceToDestinationKm;
      // Simple 0-100 score: closer = higher score. Tune the divisor as needed.
      const matchScore = Math.max(0, Math.round(100 - totalDistanceKm * 5));

      return {
        _id: ride._id.toString(),
        driverId: ride.driverId.toString(),
        driverName: ride.driverName,
        driverPhone: ride.driverPhone,
        pickupInfo: ride.pickupInfo,
        destInfo: ride.destInfo,
        encodedPolyline: ride.encodedPolyline ?? null,
        vehicle: ride.vehicle,
        seats: ride.seats,
        seatsAvailable: ride.seatsAvailable,
        date: ride.date,
        time: ride.time,
        pricingModel: ride.pricingModel,
        price: ride.price,
        status: ride.status,
        distanceToPickupKm: Math.round(c.distanceToPickupKm * 100) / 100,
        distanceToDestinationKm:
          Math.round(c.distanceToDestinationKm * 100) / 100,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({ success: true, rides: results });
}
