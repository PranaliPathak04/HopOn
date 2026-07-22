import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Ride from "@/models/Ride";
import DriverRoutePoint from "@/models/DriverRoutePoint";
import User from "@/models/User";

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
    seats,
    price,
    date,
    time,
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

  const { distanceKm } = body; // pass this from frontend, from routeInfo.distanceKm
  const pricePerKm = distanceKm > 0 ? price / distanceKm : 0;

  const ride = await Ride.create({
    driverId: driver._id,
    driverName: driver.name,
    driverPhone: driver.phone,
    pickupInfo: pickup,
    destInfo: destination,
    vehicle,
    seats,
    seatsAvailable: seats,
    date,
    time,
    price,
    distanceKm,
    pricePerKm,
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
