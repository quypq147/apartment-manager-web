import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface TenantServiceRow {
  id: string;
  name: string;
  unit: string;
  price: number | string;
  isMetered: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "TENANT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let currentContract = await prisma.contract.findFirst({
      where: {
        tenantId: userId,
        status: "ACTIVE",
      },
      select: {
        roomId: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });

    if (!currentContract) {
      currentContract = await prisma.contract.findFirst({
        where: {
          tenantId: userId,
          status: "EXPIRED",
        },
        select: {
          roomId: true,
        },
        orderBy: [{ endDate: "desc" }],
      });
    }

    if (!currentContract) {
      return NextResponse.json(
        {
          success: true,
          data: [],
        },
        { status: 200 }
      );
    }

    const roomServiceDelegate = (
      prisma as unknown as {
        roomService?: {
          findMany: (args: {
            where: { roomId: string };
            include: {
              service: {
                select: {
                  id: true;
                  name: true;
                  unit: true;
                  price: true;
                  isMetered: true;
                };
              };
            };
            orderBy: Array<{ service: { name: "asc" | "desc" } }>;
          }) => Promise<Array<{
            service: {
              id: string;
              name: string;
              unit: string;
              price: number;
              isMetered: boolean;
            };
          }>>;
        };
      }
    ).roomService;

    let services: Array<{
      id: string;
      name: string;
      unit: string;
      unitPrice: number;
      isMetered: boolean;
    }> = [];

    if (roomServiceDelegate) {
      const roomServices = await roomServiceDelegate.findMany({
        where: {
          roomId: currentContract.roomId,
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              unit: true,
              price: true,
              isMetered: true,
            },
          },
        },
        orderBy: [{ service: { name: "asc" } }],
      });

      services = roomServices.map((roomService) => ({
        id: roomService.service.id,
        name: roomService.service.name,
        unit: roomService.service.unit,
        unitPrice: roomService.service.price,
        isMetered: roomService.service.isMetered,
      }));
    } else {
      const rows = await prisma.$queryRaw<TenantServiceRow[]>`
        SELECT s."id", s."name", s."unit", s."price", s."isMetered"
        FROM "RoomService" rs
        INNER JOIN "Service" s ON s."id" = rs."serviceId"
        WHERE rs."roomId" = ${currentContract.roomId}
        ORDER BY s."name" ASC
      `;

      services = rows.map((row) => ({
        id: row.id,
        name: row.name,
        unit: row.unit,
        unitPrice: Number(row.price),
        isMetered: row.isMetered,
      }));
    }

    const data = services.map((service) => ({
      id: service.id,
      name: service.name,
      unit: service.unit,
      unitPrice: service.unitPrice,
      quantity: 1,
      isMetered: service.isMetered,
      note: service.isMetered
        ? "Dịch vụ có đồng hồ, số lượng sẽ tính theo chỉ số"
        : "Dịch vụ cố định theo tháng",
      enabled: true,
    }));

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/tenant/services error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
