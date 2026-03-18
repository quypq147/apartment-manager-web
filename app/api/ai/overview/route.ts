import { NextRequest } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!currentUser || !userRole) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { stats } = await request.json();

    if (!stats || typeof stats !== "object") {
      return new Response("Invalid stats payload", { status: 400 });
    }

    let rolePrompt = "";
    const serializedStats = JSON.stringify(stats);

    if (userRole === "LANDLORD") {
      rolePrompt = `
Bạn là trợ lý thông minh cho chủ trọ trong ứng dụng quản lý phòng trọ.
Hãy phân tích dữ liệu dashboard và tạo bản tóm tắt chuyên nghiệp 3-4 câu.
Tập trung vào tỷ lệ lấp đầy, so sánh doanh thu thực thu với doanh thu kỳ vọng và nhắc hành động nếu có hóa đơn quá hạn.
Không dùng bảng markdown, chỉ trả lời dạng văn bản tự nhiên.
Dữ liệu: ${serializedStats}
      `;
    } else if (userRole === "TENANT") {
      rolePrompt = `
Bạn là trợ lý thân thiện cho người thuê.
Hãy phân tích dữ liệu phòng và hóa đơn, tóm tắt trong 2-3 câu.
Lời văn nhẹ nhàng: chào người dùng, đề cập trạng thái hợp đồng và nhắc nếu có hóa đơn UNPAID hoặc PARTIAL.
Dữ liệu: ${serializedStats}
      `;
    } else {
      return new Response("Invalid role", { status: 400 });
    }

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system:
        "Bạn là trợ lý AI cho ứng dụng quản lý nhà trọ. Luôn trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, không bịa dữ liệu ngoài thông tin được cung cấp.",
      prompt: rolePrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Overview Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
