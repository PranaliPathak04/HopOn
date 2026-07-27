import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Ride from "@/models/Ride";
import DriverRoutePoint from "@/models/DriverRoutePoint";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to publish a ride" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const {
    pickup,
    destination,
    routeCoordinates, // [lng, lat][] from OSRM
    vehicle,
    vehicleId,
    seats,
    price,
    date,
    time,
    distanceKm,
    durationMin,
  } = body;

  if (
    !pickup ||
    !destination ||
    !routeCoordinates?.length ||
    !vehicle ||
    !seats ||
    !price ||
    !date ||
    !time
  ) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 },
    );
  }

  await connectDb();

  const driver = await User.findById((session.user as any).id);
  if (!driver) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }
  // Validate that the ride's date and time is not in the past (with a small grace period)
  const [hh, mm] = String(time).split(":").map(Number);
  const rideDateTime = new Date(date);
  rideDateTime.setHours(hh || 0, mm || 0, 0, 0);

  const gracePeriodMs = 2 * 60 * 1000; // 2 minutes
  if (rideDateTime.getTime() < Date.now() - gracePeriodMs) {
    return NextResponse.json(
      { success: false, message: "You can't publish a ride in the past" },
      { status: 400 },
    );
  }

  // Prevent a driver from publishing two rides that overlap in time — no
  // one can physically drive two routes at once. We treat each ride as
  // occupying [start, start + duration] and reject if the new ride's
  // window overlaps any existing active/full ride's window on the same day.
  // Falls back to a 60-minute assumed duration for rides that don't have
  // routeInfo.durationMin yet (shouldn't happen for new publishes, but be safe).
  const DEFAULT_DURATION_MIN = 60;
  const newDurationMin =
    body.durationMin && body.durationMin > 0
      ? body.durationMin
      : DEFAULT_DURATION_MIN;
  const newRideEnd = new Date(
    rideDateTime.getTime() + newDurationMin * 60 * 1000,
  );

  const dayStart = new Date(rideDateTime);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(rideDateTime);
  dayEnd.setHours(23, 59, 59, 999);

  const sameDayRides = await Ride.find({
    driverId: driver._id,
    status: { $in: ["active", "full"] },
    date: { $gte: dayStart, $lte: dayEnd },
  }).lean();

  for (const existing of sameDayRides) {
    const [eh, em] = String(existing.time).split(":").map(Number);
    const existingStart = new Date(existing.date);
    existingStart.setHours(eh || 0, em || 0, 0, 0);
    const existingDuration =
      existing.durationMin && existing.durationMin > 0
        ? existing.durationMin
        : DEFAULT_DURATION_MIN;
    const existingEnd = new Date(
      existingStart.getTime() + existingDuration * 60 * 1000,
    );

    const overlaps = rideDateTime < existingEnd && existingStart < newRideEnd;
    if (overlaps) {
      return NextResponse.json(
        {
          success: false,
          message: `You already have a ride scheduled around this time (${existing.time} on ${existingStart.toLocaleDateString("en-IN")}). You can't publish two overlapping rides.`,
        },
        { status: 409 },
      );
    }
  }

  // Look up the vehicle's license plate to denormalize onto the Ride —
  // avoids an extra lookup every time a rider views their booking.
  let vehicleNumber: string | null = null;
  if (vehicleId) {
    const vehicleDoc = await Vehicle.findOne({
      _id: vehicleId,
      driverId: driver._id,
    });
    if (vehicleDoc) vehicleNumber = vehicleDoc.licensePlate;
  }

  const pricePerKm = distanceKm > 0 ? price / distanceKm : 0;

  const ride = await Ride.create({
    driverId: driver._id,
    driverName: driver.name,
    driverPhone: driver.phone,
    driverPhoto: driver.photoUrl ?? null,
    pickupInfo: pickup,
    destInfo: destination,
    vehicle,
    vehicleId: vehicleId || null,
    vehicleNumber,
    seats,
    seatsAvailable: seats,
    date,
    time,
    price,
    distanceKm,
    pricePerKm,
    durationMin: durationMin,
    encodedPolyline: body.encodedPolyline || null,
    status: "active",
  });

  // Store every route point as its own document so /api/rides/find can
  // use $near directly against the 2dsphere index (no in-JS looping).
  const dateStr = new Date(date).toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const points = routeCoordinates.map(
    ([lng, lat]: [number, number], i: number) => ({
      rideId: ride._id,
      driverId: driver._id,
      date: dateStr,
      sequence: i,
      location: { type: "Point", coordinates: [lng, lat] },
    }),
  );

  await DriverRoutePoint.insertMany(points);

  return NextResponse.json({ success: true, ride });
}
