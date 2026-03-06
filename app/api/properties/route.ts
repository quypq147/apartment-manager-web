import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CreatePropertyBody {
  name: string;
  address: string;
  description?: string;
}

/**
 * GET /api/properties
 * Fetch all properties for the authenticated landlord
 * Headers required: x-user-id (landlord ID), x-user-role
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const properties = await prisma.property.findMany({
      where: { landlordId: userId },
      include: {
        rooms: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: properties,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/properties error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Create a new property for the authenticated landlord
 * Headers required: x-user-id (landlord ID), x-user-role
 * Body: { name, address, description? }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreatePropertyBody;
    const { name, address, description } = body;

    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json(
        { success: false, error: "name and address are required" },
        { status: 400 }
      );
    }

    const newProperty = await prisma.property.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        description: description?.trim() || null,
        landlordId: userId,
      },
      include: { rooms: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Property created successfully",
        data: newProperty,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/properties error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
