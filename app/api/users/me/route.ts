import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDb } from "@/lib/db";
import User from "@/models/User";

// GET /api/users/me
// Returns the logged-in user's full profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  await connectDb();

  const user = await User.findById((session.user as any).id)
    .select("-passwordHash") // never send password hash to client
    .lean();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    user: { ...user, _id: user._id.toString() },
  });
}

// PATCH /api/users/me
// Update allowed profile fields only
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  const body = await req.json();

  // Whitelist — only these fields can be updated by the user
  const allowed = [
    "name",
    "phone",
    "licenseNumber",
    "photoUrl",
    "licensePhotoUrl",
    "addresses",
  ];
  const updates: Record<string, any> = {};

  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  // Validate addresses array if provided
  if (updates.addresses) {
    if (!Array.isArray(updates.addresses) || updates.addresses.length > 5) {
      return NextResponse.json(
        { success: false, message: "Maximum 5 addresses allowed" },
        { status: 400 },
      );
    }
    for (const addr of updates.addresses) {
      if (
        !addr.label ||
        !addr.latitude ||
        !addr.longitude ||
        !addr.displayName
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each address needs label, latitude, longitude and displayName",
          },
          { status: 400 },
        );
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, message: "No valid fields to update" },
      { status: 400 },
    );
  }

  await connectDb();

  const user = await User.findByIdAndUpdate(
    (session.user as any).id,
    { $set: updates },
    { new: true },
  )
    .select("-passwordHash")
    .lean();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    user: { ...user, _id: user._id.toString() },
  });
}
