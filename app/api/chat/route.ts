import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userRole = currentUser?.role;

    if (!currentUser || !userRole) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as { messages?: unknown };
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages = (await convertToModelMessages(rawMessages)).slice(-20);

    const systemPrompt = `
Bạn là trợ lý AI chuyên nghiệp, thân thiện trong ứng dụng quản lý nhà trọ HomeManager.
Bạn đang hỗ trợ người dùng có vai trò: ${userRole}.
- Nếu là LANDLORD: hỗ trợ phân tích doanh thu, công nợ, vận hành phòng và quy trình quản lý.
- Nếu là TENANT: hỗ trợ về hóa đơn, thanh toán, hợp đồng, yêu cầu dịch vụ.
- Nếu là ADMIN: hỗ trợ giám sát hệ thống và giải thích tính năng.
Trả lời ngắn gọn, rõ ý, ưu tiên tiếng Việt.
Không bịa thông tin ngoài ngữ cảnh cuộc trò chuyện.
    `;

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages,
      temperature: 0.4,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
