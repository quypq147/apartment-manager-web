import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type LandlordStatus = "ACTIVE" | "PENDING_VERIFICATION" | "REJECTED";

interface RouteContext {
  params: Promise<{
    landlordId: string;
  }>;
}

const STATUS_VALUES: LandlordStatus[] = ["ACTIVE", "PENDING_VERIFICATION", "REJECTED"];

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { landlordId } = await context.params;
    if (!landlordId) {
      return NextResponse.json(
        { success: false, error: "landlordId is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { status?: string };
    const status = body.status;

    if (!status || !STATUS_VALUES.includes(status as LandlordStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const landlord = await prisma.user.findUnique({
      where: { id: landlordId },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!landlord || landlord.role !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Landlord not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: landlordId },
      data: {
        landlordApprovalStatus: status as LandlordStatus,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Landlord status updated",
        data: {
          ...landlord,
          status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/landlords/[landlordId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
