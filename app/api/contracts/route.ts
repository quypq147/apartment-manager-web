import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateNextUserId } from "@/lib/user-id";

interface CreateContractBody {
  roomId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;
  tenantCccd?: string;
  tenantPassword?: string;
  deposit: number;
  roomPrice?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
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

    const body = (await request.json()) as CreateContractBody;
    const {
      roomId,
      tenantName,
      tenantEmail,
      tenantPhone,
      tenantCccd,
      tenantPassword,
      deposit,
      roomPrice,
      startDate,
      endDate,
      notes,
    } = body;

    if (!roomId || !tenantName?.trim() || !tenantEmail?.trim() || !startDate) {
      return NextResponse.json(
        {
          success: false,
          error: "roomId, tenantName, tenantEmail and startDate are required",
        },
        { status: 400 }
      );
    }

    if (typeof deposit !== "number" || Number.isNaN(deposit) || deposit < 0) {
      return NextResponse.json(
        { success: false, error: "deposit must be a number >= 0" },
        { status: 400 }
      );
    }

    const parsedStartDate = new Date(startDate);
    if (Number.isNaN(parsedStartDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid startDate" },
        { status: 400 }
      );
    }

    const parsedEndDate = endDate ? new Date(endDate) : null;
    if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid endDate" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        property: {
          landlordId: userId,
        },
      },
      include: {
        contracts: {
          where: {
            status: "ACTIVE",
          },
          select: { id: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 400 }
      );
    }

    if (room.contracts.length > 0) {
      return NextResponse.json(
        { success: false, error: "Room already has an active contract" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let tenant = await tx.user.findUnique({
        where: { email: tenantEmail.trim().toLowerCase() },
      });

      if (!tenant) {
        const tenantId = await generateNextUserId(tx, "TENANT");
        const now = new Date();

        tenant = await tx.user.create({
          data: {
            id: tenantId,
            email: tenantEmail.trim().toLowerCase(),
            password: tenantPassword?.trim() || "123456",
            name: tenantName.trim(),
            phone: tenantPhone?.trim() || null,
            cccd: tenantCccd?.trim() || null,
            role: "TENANT",
            createdAt: now,
            updatedAt: now,
          },
        });
      }

      const actualRoomPrice =
        typeof roomPrice === "number" && roomPrice > 0 ? roomPrice : room.price;

      const contract = await tx.contract.create({
        data: {
          roomId: room.id,
          tenantId: tenant.id,
          deposit,
          roomPrice: actualRoomPrice,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          notes: notes?.trim() || null,
          status: "ACTIVE",
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              cccd: true,
            },
          },
          room: {
            include: {
              property: {
                select: { id: true, name: true, address: true },
              },
            },
          },
        },
      });

      await tx.room.update({
        where: { id: room.id },
        data: { status: "RENTED" },
      });

      const now = new Date();
      await tx.invoice.create({
        data: {
          title: `Hóa đơn tháng ${now.getMonth() + 1}/${now.getFullYear()} (Tháng đầu + Cọc)`,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          totalAmount: deposit + actualRoomPrice,
          status: "UNPAID",
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          contractId: contract.id,
        },
      });

      return contract;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Contract created successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/contracts error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
