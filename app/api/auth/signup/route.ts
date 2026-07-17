import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "name, email, phone and password are all required",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    await connectDb();

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email or phone already exists",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, phone, passwordHash });

    return NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong creating your account" },
      { status: 500 },
    );
  }
}
