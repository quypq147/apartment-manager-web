import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
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

    const { tenantId } = await params;
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      cccd?: string;
      email?: string;
    };

    const { name, phone, cccd, email } = body;
    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedCccd = cccd?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!trimmedName && !trimmedPhone && !trimmedCccd && !normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const validContract = await prisma.contract.findFirst({
      where: {
        tenantId,
        room: {
          property: {
            landlordId: userId,
          },
        },
      },
      select: { id: true },
    });

    if (!validContract) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy khách thuê hoặc bạn không có quyền chỉnh sửa",
        },
        { status: 403 }
      );
    }

    const updatedTenant = await prisma.user.update({
      where: { id: tenantId },
      data: {
        ...(trimmedName && { name: trimmedName }),
        ...(trimmedPhone && { phone: trimmedPhone }),
        ...(trimmedCccd && { cccd: trimmedCccd }),
        ...(normalizedEmail && { email: normalizedEmail }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cccd: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật thành công",
        data: updatedTenant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/tenants/[tenantId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
