import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import Vehicle from "@/models/Vehicle";

// PATCH /api/vehicles/[id]
// Set a vehicle as default
export async function PATCH(
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

  const driverId = (session.user as any).id;

  const vehicle = await Vehicle.findOne({
    _id: id,
    driverId,
    isActive: true,
  });

  if (!vehicle) {
    return NextResponse.json(
      { success: false, message: "Vehicle not found" },
      { status: 404 },
    );
  }

  // Unset all other defaults for this driver
  await Vehicle.updateMany(
    { driverId, _id: { $ne: id } },
    { $set: { isDefault: false } },
  );

  vehicle.isDefault = true;
  await vehicle.save();

  return NextResponse.json({
    success: true,
    vehicle: {
      ...vehicle.toObject(),
      _id: vehicle._id.toString(),
      driverId: vehicle.driverId.toString(),
    },
  });
}

// DELETE /api/vehicles/[id]
// Soft delete — sets isActive to false
export async function DELETE(
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

  const driverId = (session.user as any).id;

  const vehicle = await Vehicle.findOne({
    _id: id,
    driverId,
    isActive: true,
  });

  if (!vehicle) {
    return NextResponse.json(
      { success: false, message: "Vehicle not found" },
      { status: 404 },
    );
  }

  const wasDefault = vehicle.isDefault;

  // Soft delete
  vehicle.isActive = false;
  vehicle.isDefault = false;
  await vehicle.save();

  // If this was the default, make the next available vehicle the default
  if (wasDefault) {
    const nextVehicle = await Vehicle.findOne({ driverId, isActive: true });
    if (nextVehicle) {
      nextVehicle.isDefault = true;
      await nextVehicle.save();
    }
  }

  return NextResponse.json({ success: true });
}
