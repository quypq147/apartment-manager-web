import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

type SettingsPayload = {
  platformCommissionRate?: number;
  autoApproveLandlords?: boolean;
  maintenanceMode?: boolean;
  supportEmail?: string;
};

const SYSTEM_SETTINGS_ID = 1;

function getRequester(request: NextRequest) {
  return getCurrentUser().then((currentUser) => {
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    return {
      userId,
      userRole,
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { userId, userRole } = await getRequester(request);

    if (!userId || userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: await prisma.adminSystemSetting.upsert({
          where: { id: SYSTEM_SETTINGS_ID },
          create: { id: SYSTEM_SETTINGS_ID },
          update: {},
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/settings error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, userRole } = await getRequester(request);

    if (!userId || userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SettingsPayload;
    const patch: SettingsPayload = {};

    if (typeof body.platformCommissionRate !== "undefined") {
      if (
        typeof body.platformCommissionRate !== "number" ||
        Number.isNaN(body.platformCommissionRate) ||
        body.platformCommissionRate < 0 ||
        body.platformCommissionRate > 100
      ) {
        return NextResponse.json(
          { success: false, error: "Tỷ lệ hoa hồng phải nằm trong khoảng 0-100" },
          { status: 400 }
        );
      }

      patch.platformCommissionRate = Number(body.platformCommissionRate.toFixed(2));
    }

    if (typeof body.autoApproveLandlords !== "undefined") {
      if (typeof body.autoApproveLandlords !== "boolean") {
        return NextResponse.json(
          { success: false, error: "autoApproveLandlords phải là boolean" },
          { status: 400 }
        );
      }

      patch.autoApproveLandlords = body.autoApproveLandlords;
    }

    if (typeof body.maintenanceMode !== "undefined") {
      if (typeof body.maintenanceMode !== "boolean") {
        return NextResponse.json(
          { success: false, error: "maintenanceMode phải là boolean" },
          { status: 400 }
        );
      }

      patch.maintenanceMode = body.maintenanceMode;
    }

    if (typeof body.supportEmail !== "undefined") {
      if (typeof body.supportEmail !== "string") {
        return NextResponse.json(
          { success: false, error: "Email hỗ trợ không hợp lệ" },
          { status: 400 }
        );
      }

      const normalizedEmail = body.supportEmail.trim().toLowerCase();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

      if (!isValidEmail) {
        return NextResponse.json(
          { success: false, error: "Email hỗ trợ không hợp lệ" },
          { status: 400 }
        );
      }

      patch.supportEmail = normalizedEmail;
    }

    const updatedSettings = await prisma.adminSystemSetting.upsert({
      where: { id: SYSTEM_SETTINGS_ID },
      create: {
        id: SYSTEM_SETTINGS_ID,
        platformCommissionRate: patch.platformCommissionRate ?? 5,
        autoApproveLandlords: patch.autoApproveLandlords ?? false,
        maintenanceMode: patch.maintenanceMode ?? false,
        supportEmail: patch.supportEmail ?? "support@homemanager.vn",
        updatedBy: userId,
      },
      update: {
        ...patch,
        updatedBy: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật cài đặt hệ thống thành công",
        data: updatedSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/settings error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
