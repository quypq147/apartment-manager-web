import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CreateRoomBody {
  name: string;
  price: number;
  capacity: number;
  area?: number;
}

interface RouteContext {
  params: {
    propertyId: string;
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { propertyId } = context.params;
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "propertyId is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as CreateRoomBody;
    const { name, price, capacity, area } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: "price must be a positive number" },
        { status: 400 }
      );
    }

    if (
      typeof capacity !== "number" ||
      Number.isNaN(capacity) ||
      !Number.isInteger(capacity) ||
      capacity <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "capacity must be a positive integer" },
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

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        price,
        capacity,
        area: typeof area === "number" ? area : null,
        propertyId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Room created successfully",
        data: room,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/properties/[propertyId]/rooms error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
