import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// --- শুধুমাত্র প্রথম অ্যাডমিন ইউজার তৈরি করার জন্য একটি বিশেষ API ---

export async function GET() {
  try {
    await connectDB();

    // ধাপ ১: চেক করা হচ্ছে যে ডাটাবেসে কোনো ইউজার আছে কিনা
    const userCount = await User.countDocuments();
    
    // যদি একজনও ইউজার থাকে, তাহলে নতুন ইউজার তৈরি করা হবে না
    if (userCount > 0) {
      return NextResponse.json(
        { message: "Admin user already exists. Setup is complete." },
        { status: 409 } // 409 Conflict
      );
    }

    // ধাপ ২: যদি কোনো ইউজার না থাকে, তাহলে প্রথম অ্যাডমিন ইউজার তৈরি করা
    const name = process.env.ADMIN_NAME || "Admin";
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // নিশ্চিত করা হচ্ছে যে এনভায়রনমেন্ট ভ্যারিয়েবলগুলো সেট করা আছে
    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Admin user created successfully! You can now log in." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Admin Setup Error:", error);
    return NextResponse.json(
      { message: "An error occurred during admin setup.", error: error.message },
      { status: 500 }
    );
  }
}