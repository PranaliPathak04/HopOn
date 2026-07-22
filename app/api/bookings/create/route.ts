import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import { haversineDistanceKm } from "@/lib/geo";
import Ride from "@/models/Ride";
import Booking from "@/models/Booking";
import DriverRoutePoint from "@/models/DriverRoutePoint";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to book a seat" },
      { status: 401 },
    );
  }

  const { rideId, seatsBooked, pickupInfo, dropInfo, pickupLabel, dropLabel } =
    await req.json();

  if (!rideId || !seatsBooked || !pickupInfo || !dropInfo) {
    return NextResponse.json(
      {
        success: false,
        message: "rideId, seatsBooked, pickupInfo and dropInfo are required",
      },
      { status: 400 },
    );
  }

  await connectDb();

  const ride = await Ride.findById(rideId);
  if (!ride || ride.status !== "active") {
    return NextResponse.json(
      { success: false, message: "This ride is no longer available" },
      { status: 404 },
    );
  }

  // Atomic compare-and-swap: only succeeds if enough seats are STILL available
  // at the moment of the update. This is what prevents two riders both
  // grabbing the last seat in a race condition — the DB, not our JS code,
  // enforces the seat count never goes negative.
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: rideId, seatsAvailable: { $gte: seatsBooked } },
    {
      $inc: { seatsAvailable: -seatsBooked },
      $set: {},
    },
    { new: true },
  );

  if (!updatedRide) {
    return NextResponse.json(
      { success: false, message: "Not enough seats available" },
      { status: 409 },
    );
  }

  if (updatedRide.seatsAvailable === 0) {
    updatedRide.status = "full";
    await updatedRide.save();
  }

  const segmentDistanceKm = haversineDistanceKm(
    pickupInfo.latitude,
    pickupInfo.longitude,
    dropInfo.latitude,
    dropInfo.longitude,
  );

  const pricePerKm =
    ride.pricePerKm != null && ride.pricePerKm > 0
      ? ride.pricePerKm
      : ride.distanceKm != null && ride.distanceKm > 0
        ? ride.price / ride.distanceKm
        : ride.price;

  const fare = Math.round(segmentDistanceKm * pricePerKm * seatsBooked);

  // Find where this pickup falls along the driver's route, so the driver's
  // dashboard can list stops in the order they'll actually be reached.
  const dateStr = new Date(ride.date).toISOString().slice(0, 10);
  let pickupSequence: number | null = null;
  try {
    const nearestPoint = await DriverRoutePoint.findOne({
      rideId,
      date: dateStr,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickupInfo.longitude, pickupInfo.latitude],
          },
          $maxDistance: 3000, // 3km — generous, this is just for ordering, not matching
        },
      },
    }).lean();
    if (nearestPoint) pickupSequence = nearestPoint.sequence;
  } catch (err) {
    console.error("Could not determine pickup sequence:", err);
    // Non-fatal — booking still proceeds, stop just won't have an order
  }

  try {
    const booking = await Booking.create({
      rideId,
      riderId: (session.user as any).id,
      seatsBooked,
      pickupInfo,
      pickupLabel: pickupLabel || null,
      dropInfo,
      dropLabel: dropLabel || null,
      pickupSequence,
      segmentDistanceKm,
      fare,
      status: "confirmed",
      paymentStatus: "pending",
    });

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    // Booking write failed after we already decremented seats — roll back
    // so seats aren't silently lost.
    await Ride.findByIdAndUpdate(rideId, {
      $inc: { seatsAvailable: seatsBooked },
      $set: { status: "active" },
    });
    console.error("Booking creation failed, rolled back seats:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong creating the booking" },
      { status: 500 },
    );
  }
}
