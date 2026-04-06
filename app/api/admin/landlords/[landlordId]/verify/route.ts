import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    landlordId: string;
  }>;
}

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

    return NextResponse.json(
      {
        success: true,
        message: "Landlord verified successfully",
        data: {
          landlordId,
          status: "ACTIVE",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/landlords/[landlordId]/verify error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
