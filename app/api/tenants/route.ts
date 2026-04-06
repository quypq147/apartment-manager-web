import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateNextUserId } from "@/lib/user-id";
import { hashPassword } from "@/lib/password";

interface CreateTenantBody {
  name: string;
  email: string;
  phone?: string;
  cccd?: string;
  password?: string;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const contracts = await prisma.contract.findMany({
      where: {
        room: {
          property: {
            landlordId: userId,
          },
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
            role: true,
          },
        },
        room: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
        invoices: {
          select: {
            id: true,
            title: true,
            month: true,
            year: true,
            totalAmount: true,
            status: true,
            dueDate: true,
          },
          orderBy: [{ year: "desc" }, { month: "desc" }],
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json(
      {
        success: true,
        data: contracts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/tenants error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateTenantBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || null;
    const cccd = body.cccd?.trim() || null;
    const rawPassword = body.password?.trim() || "123456";

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "name and email are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (rawPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    const tenantId = await generateNextUserId(prisma, "TENANT");
    const password = await hashPassword(rawPassword);

    const tenant = await prisma.user.create({
      data: {
        id: tenantId,
        name,
        email,
        phone,
        cccd,
        password,
        role: "TENANT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cccd: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tenant created successfully",
        data: tenant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/tenants error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
