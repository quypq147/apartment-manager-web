import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    propertyId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    const { propertyId } = await context.params;
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "propertyId is required" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        landlordId: userId,
      },
      include: {
        rooms: {
          include: {
            contracts: {
              select: {
                id: true,
                status: true,
                tenantId: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        services: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: property,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/properties/[propertyId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
