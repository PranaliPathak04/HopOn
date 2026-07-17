import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import { haversineDistanceKm } from "@/lib/geo";
import Ride from "@/models/Ride";
import Booking from "@/models/Booking";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to book a seat" },
      { status: 401 },
    );
  }

  const { rideId, seatsBooked, pickupInfo, dropInfo } = await req.json();

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
  const fare = Math.round(segmentDistanceKm * ride.price * seatsBooked);

  try {
    const booking = await Booking.create({
      rideId,
      riderId: (session.user as any).id,
      seatsBooked,
      pickupInfo,
      dropInfo,
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
