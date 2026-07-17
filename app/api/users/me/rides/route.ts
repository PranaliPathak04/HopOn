import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Ride from "@/models/Ride";
import Booking from "@/models/Booking";

// GET /api/users/me/rides
// Returns all rides published by the logged-in driver, with live booking counts.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  await connectDb();

  const rides = await Ride.find({
    driverId: (session.user as any).id,
  })
    .sort({ date: -1 })
    .lean();

  const rideIds = rides.map((r) => r._id);

  // Count confirmed bookings per ride in one aggregation
  const bookingCounts = await Booking.aggregate([
    {
      $match: {
        rideId: { $in: rideIds },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: "$rideId",
        count: { $sum: 1 },
        totalSeatsBooked: { $sum: "$seatsBooked" },
        totalRevenue: { $sum: "$fare" },
      },
    },
  ]);

  const countByRide = new Map(bookingCounts.map((b) => [b._id.toString(), b]));

  const result = rides.map((r) => {
    const stats = countByRide.get(r._id.toString());
    return {
      ...r,
      _id: r._id.toString(),
      driverId: r.driverId.toString(),
      bookingCount: stats?.count ?? 0,
      totalSeatsBooked: stats?.totalSeatsBooked ?? 0,
      totalRevenue: stats?.totalRevenue ?? 0,
    };
  });

  return NextResponse.json({ success: true, rides: result });
}
