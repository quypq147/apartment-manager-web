import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateNextUserId } from "@/lib/user-id";
import { hashPassword } from "@/lib/password";

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: { exists: Boolean(existingUser) },
    });
  } catch (error) {
    console.error("GET /api/auth/register error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterBody;
    const { email, password, name, phone, role } = body;

    // Validate input
    if (!email?.trim() || !password?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (typeof role === "string" && role !== "LANDLORD" && role !== "TENANT") {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    const userId = await generateNextUserId(prisma, "LANDLORD");
    const hashedPassword = await hashPassword(password.trim());
    const now = new Date();

    // Create new user (LANDLORD for new registrations)
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        phone: phone?.trim() || null,
        role: role === "TENANT" ? "TENANT" : "LANDLORD", // Default registration is landlord
        createdAt: now,
        updatedAt: now,
      },
    });


    // Return user without password
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      cccd: user.cccd,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
