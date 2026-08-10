import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Booking from "@/models/Booking";
import Ride from "@/models/Ride";

// POST /api/bookings/[id]/verify-otp
// Called by the DRIVER at pickup — rider tells them the code shown on
// their booking card, driver types it in here. Only the ride's driver
// can verify (not the rider themself — that would defeat the point).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  const { otp } = await req.json();
  if (!otp) {
    return NextResponse.json(
      { success: false, message: "OTP is required" },
      { status: 400 },
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

  const ride = await Ride.findById(booking.rideId);
  if (!ride || ride.driverId.toString() !== (session.user as any).id) {
    return NextResponse.json(
      { success: false, message: "Not your ride" },
      { status: 403 },
    );
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json(
      { success: false, message: "This booking is no longer active" },
      { status: 400 },
    );
  }

  if (booking.otpVerified) {
    return NextResponse.json({
      success: true,
      message: "Already verified",
      booking,
    });
  }

  if (String(otp) !== booking.otp) {
    return NextResponse.json(
      { success: false, message: "Incorrect OTP" },
      { status: 400 },
    );
  }

  booking.otpVerified = true;
  await booking.save();

  return NextResponse.json({ success: true, booking });
}
