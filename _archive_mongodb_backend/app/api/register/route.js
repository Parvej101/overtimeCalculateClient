// src/app/api/register/route.js
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password, secretKey } = await req.json();

    // Check if the provided secret key matches the one in environment variables
    if (secretKey !== process.env.REGISTRATION_SECRET_KEY) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid secret key." },
        { status: 401 } // 401 Unauthorized
      );
    }

    await connectDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "User registered." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}