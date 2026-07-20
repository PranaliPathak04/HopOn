import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Vehicle from "@/models/Vehicle";

// GET /api/vehicles
// Returns all active vehicles for the logged-in driver
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  await connectDb();

  const vehicles = await Vehicle.find({
    driverId: (session.user as any).id,
    isActive: true,
  })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    success: true,
    vehicles: vehicles.map((v) => ({
      ...v,
      _id: v._id.toString(),
      driverId: v.driverId.toString(),
    })),
  });
}

// POST /api/vehicles
// Add a new vehicle for the logged-in driver
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  const { make, model, type, color, licensePlate, seats, isDefault } =
    await req.json();

  if (!make || !model || !type || !color || !licensePlate || !seats) {
    return NextResponse.json(
      { success: false, message: "All vehicle fields are required" },
      { status: 400 },
    );
  }

  await connectDb();

  const driverId = (session.user as any).id;

  // Check duplicate plate for this driver
  const existing = await Vehicle.findOne({
    driverId,
    licensePlate: licensePlate.toUpperCase().trim(),
    isActive: true,
  });

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message: "You already have a vehicle with this license plate",
      },
      { status: 409 },
    );
  }

  // If this is being set as default, unset all others first
  if (isDefault) {
    await Vehicle.updateMany({ driverId }, { $set: { isDefault: false } });
  }

  // If this is the first vehicle, auto-set as default
  const vehicleCount = await Vehicle.countDocuments({
    driverId,
    isActive: true,
  });
  const shouldBeDefault = isDefault || vehicleCount === 0;

  const vehicle = await Vehicle.create({
    driverId,
    make,
    model,
    type,
    color,
    licensePlate: licensePlate.toUpperCase().trim(),
    seats,
    isDefault: shouldBeDefault,
  });

  return NextResponse.json({
    success: true,
    vehicle: {
      ...vehicle.toObject(),
      _id: vehicle._id.toString(),
      driverId: vehicle.driverId.toString(),
    },
  });
}
