import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface UpdateServiceBody {
  name: string;
  unit: string;
  price: number;
  isMetered?: boolean;
}

interface RouteContext {
  params:
    | {
        serviceId: string;
      }
    | Promise<{
        serviceId: string;
      }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

    const { serviceId } = await context.params;
    const body = (await request.json()) as UpdateServiceBody;
    const { name, unit, price, isMetered } = body;

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: "serviceId is required" },
        { status: 400 }
      );
    }

    if (!name?.trim() || !unit?.trim()) {
      return NextResponse.json(
        { success: false, error: "name and unit are required" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, error: "price must be a non-negative number" },
        { status: 400 }
      );
    }

    const existing = await prisma.service.findFirst({
      where: {
        id: serviceId,
        property: {
          landlordId: userId,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
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
        message: "Service updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/services/[serviceId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const { serviceId } = await context.params;

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: "serviceId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.service.findFirst({
      where: {
        id: serviceId,
        property: {
          landlordId: userId,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/services/[serviceId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
