import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Booking from "@/models/Booking";
import Ride from "@/models/Ride";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to cancel a booking" },
      { status: 401 },
    );
  }

  await connectDb();

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json(
      { success: false, message: "Booking not found" },
      { status: 404 },
    );
  }

  if (booking.riderId.toString() !== (session.user as any).id) {
    return NextResponse.json(
      { success: false, message: "Not your booking" },
      { status: 403 },
    );
  }

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { success: false, message: "Booking is already cancelled" },
      { status: 400 },
    );
  }

  booking.status = "cancelled";
  await booking.save();

  // Restore the seats to the ride, and flip it back to active if it had
  // been marked full.
  await Ride.findByIdAndUpdate(booking.rideId, {
    $inc: { seatsAvailable: booking.seatsBooked },
    $set: { status: "active" },
  });

  return NextResponse.json({ success: true, booking });
}
