import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logout successful" },
      { status: 200 }
    );

    // Clear cookies
    response.cookies.delete("user_id");
    response.cookies.delete("user_role");

    return response;
  } catch (error) {
    console.error("POST /api/auth/logout error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
