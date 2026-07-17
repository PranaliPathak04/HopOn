import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Booking from "@/models/Booking";
import Ride from "@/models/Ride";

// GET /api/users/me/bookings
// Returns all bookings for the logged-in rider, with ride details inline.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  await connectDb();

  const bookings = await Booking.find({
    riderId: (session.user as any).id,
  })
    .sort({ createdAt: -1 })
    .lean();

  // Populate ride details for each booking in one query
  const rideIds = bookings.map((b) => b.rideId);
  const rides = await Ride.find({ _id: { $in: rideIds } }).lean();
  const rideById = new Map(rides.map((r) => [r._id.toString(), r]));

  const result = bookings.map((b) => ({
    ...b,
    _id: b._id.toString(),
    rideId: b.rideId.toString(),
    riderId: b.riderId.toString(),
    ride: rideById.get(b.rideId.toString()) ?? null,
  }));

  return NextResponse.json({ success: true, bookings: result });
}
