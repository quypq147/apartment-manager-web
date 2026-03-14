import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface CreateServiceBody {
  propertyId: string;
  name: string;
  unit: string;
  price: number;
  isMetered?: boolean;
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

    const propertyId = request.nextUrl.searchParams.get("propertyId") ?? undefined;

    const services = await prisma.service.findMany({
      where: {
        property: {
          landlordId: userId,
        },
        ...(propertyId ? { propertyId } : {}),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: [{ propertyId: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(
      {
        success: true,
        data: services,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/services error", error);
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

    const body = (await request.json()) as CreateServiceBody;
    const { propertyId, name, unit, price, isMetered } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "propertyId is required" },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    if (!unit?.trim()) {
      return NextResponse.json(
        { success: false, error: "unit is required" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, error: "price must be a non-negative number" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        landlordId: userId,
      },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        propertyId,
        name: name.trim(),
        unit: unit.trim(),
        price,
        isMetered: Boolean(isMetered),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: service,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/services error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
