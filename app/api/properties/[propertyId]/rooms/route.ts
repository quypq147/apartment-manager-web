import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface CreateRoomBody {
  name: string;
  price: number;
  capacity: number;
  area?: number;
  serviceIds?: string[];
}

interface RouteContext {
  params:
    | {
        propertyId: string;
      }
    | Promise<{
    propertyId: string;
      }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    const userRole = currentUser?.role;

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

    const body = (await request.json()) as CreateRoomBody;
    const { name, price, capacity, area, serviceIds } = body;

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

    const room = await prisma.$transaction(async (tx) => {
      const createdRoom = await tx.room.create({
        data: {
          name: name.trim(),
          price,
          capacity,
          area: typeof area === "number" ? area : null,
          propertyId,
        },
      });

      const normalizedServiceIds = Array.isArray(serviceIds)
        ? [...new Set(serviceIds.filter((id) => typeof id === "string" && id.trim()))]
        : [];

      const existingDefaultServices = await tx.service.findMany({
        where: {
          propertyId,
          OR: [
            { name: { equals: "Điện", mode: "insensitive" } },
            { name: { equals: "Nước", mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
        },
      });

      const defaultByName = new Map(
        existingDefaultServices.map((service) => [service.name.toLowerCase(), service.id])
      );

      const missingDefaults: Array<{
        name: "Điện" | "Nước";
        unit: string;
        price: number;
        isMetered: boolean;
      }> = [];

      if (!defaultByName.has("điện")) {
        missingDefaults.push({ name: "Điện", unit: "kWh", price: 3500, isMetered: true });
      }

      if (!defaultByName.has("nước")) {
        missingDefaults.push({ name: "Nước", unit: "m3", price: 25000, isMetered: true });
      }

      if (missingDefaults.length > 0) {
        await tx.service.createMany({
          data: missingDefaults.map((service) => ({
            propertyId,
            name: service.name,
            unit: service.unit,
            price: service.price,
            isMetered: service.isMetered,
          })),
        });
      }

      const latestDefaults = await tx.service.findMany({
        where: {
          propertyId,
          OR: [
            { name: { equals: "Điện", mode: "insensitive" } },
            { name: { equals: "Nước", mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });

      const finalServiceIds = Array.from(
        new Set([...normalizedServiceIds, ...latestDefaults.map((service) => service.id)])
      );

      if (finalServiceIds.length > 0) {
        const validServices = await tx.service.findMany({
          where: {
            id: { in: finalServiceIds },
            propertyId,
          },
          select: { id: true },
        });

        if (validServices.length > 0) {
          await tx.roomService.createMany({
            data: validServices.map((service) => ({
              roomId: createdRoom.id,
              serviceId: service.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return createdRoom;
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
