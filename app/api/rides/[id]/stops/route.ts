import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Ride from "@/models/Ride";
import Booking from "@/models/Booking";
import User from "@/models/User";

// GET /api/rides/[id]/stops
// Returns confirmed bookings for a ride the logged-in user is driving,
// grouped by pickup location and ordered by where they fall along the route.
export async function GET(
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

  await connectDb();

  const ride = await Ride.findById(id);
  if (!ride) {
    return NextResponse.json(
      { success: false, message: "Ride not found" },
      { status: 404 },
    );
  }

  if (ride.driverId.toString() !== (session.user as any).id) {
    return NextResponse.json(
      { success: false, message: "Not your ride" },
      { status: 403 },
    );
  }

  const bookings = await Booking.find({
    rideId: id,
    status: "confirmed",
  })
    .sort({ pickupSequence: 1 })
    .lean();

  if (bookings.length === 0) {
    return NextResponse.json({ success: true, stops: [] });
  }

  // Populate rider names + phones
  const riderIds = bookings.map((b) => b.riderId);
  const riders = await User.find({ _id: { $in: riderIds } })
    .select("name phone")
    .lean();
  const riderById = new Map(riders.map((r) => [r._id.toString(), r]));

  // Group bookings by rounded coordinates so nearby pickups (within ~50m)
  // count as the same stop — riders rarely share the exact same lat/lng.
  const roundCoord = (n: number) => Math.round(n * 2000) / 2000; // ~50m precision

  const stopMap = new Map<
    string,
    {
      key: string;
      latitude: number;
      longitude: number;
      label: string | null;
      pickupSequence: number | null;
      riders: {
        name: string;
        phone: string;
        seatsBooked: number;
        bookingId: string;
      }[];
      totalSeats: number;
    }
  >();

  for (const b of bookings) {
    const lat = roundCoord(b.pickupInfo.latitude);
    const lng = roundCoord(b.pickupInfo.longitude);
    const key = `${lat},${lng}`;
    const rider = riderById.get(b.riderId.toString());

    if (!stopMap.has(key)) {
      stopMap.set(key, {
        key,
        latitude: b.pickupInfo.latitude,
        longitude: b.pickupInfo.longitude,
        label: b.pickupLabel ?? null,
        pickupSequence: b.pickupSequence ?? null,
        riders: [],
        totalSeats: 0,
      });
    }

    const stop = stopMap.get(key)!;
    stop.riders.push({
      name: rider?.name ?? "Unknown rider",
      phone: rider?.phone ?? "",
      seatsBooked: b.seatsBooked,
      bookingId: b._id.toString(),
    });
    stop.totalSeats += b.seatsBooked;

    // Keep the earliest sequence number seen for this stop group
    if (
      b.pickupSequence != null &&
      (stop.pickupSequence == null || b.pickupSequence < stop.pickupSequence)
    ) {
      stop.pickupSequence = b.pickupSequence;
    }
  }

  const stops = Array.from(stopMap.values()).sort((a, b) => {
    if (a.pickupSequence == null) return 1;
    if (b.pickupSequence == null) return -1;
    return a.pickupSequence - b.pickupSequence;
  });

  return NextResponse.json({ success: true, stops });
}
