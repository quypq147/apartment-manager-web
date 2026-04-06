import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { getCurrentUser } from "@/lib/auth";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const HISTORY_LIMIT = 50;

function getChatStore() {
  const globalWithStore = globalThis as typeof globalThis & {
    __chatHistoryStore?: Map<string, ChatMessage[]>;
  };

  if (!globalWithStore.__chatHistoryStore) {
    globalWithStore.__chatHistoryStore = new Map<string, ChatMessage[]>();
  }

  return globalWithStore.__chatHistoryStore;
}

function pushHistory(userId: string, role: "user" | "assistant", content: string) {
  const store = getChatStore();
  const list = store.get(userId) ?? [];
  list.push({ role, content, createdAt: new Date().toISOString() });
  if (list.length > HISTORY_LIMIT) {
    list.splice(0, list.length - HISTORY_LIMIT);
  }
  store.set(userId, list);
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser.role) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getChatStore();
    const history = store.get(currentUser.id) ?? [];

    return new Response(
      JSON.stringify({
        success: true,
        data: history,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("GET /api/chat error", error);
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userRole = currentUser?.role;

    if (!currentUser || !userRole) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as { messages?: unknown; message?: unknown };

    if (typeof body.message === "string") {
      const message = body.message.trim();

      if (!message) {
        return new Response(
          JSON.stringify({ success: false, error: "Message is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const reply =
        userRole === "LANDLORD"
          ? "Mình đã nhận câu hỏi. Bạn có thể vào mục Tổng quan để xem AI Overview doanh thu và công nợ." 
          : userRole === "TENANT"
            ? "Mình đã nhận câu hỏi. Bạn có thể xem hóa đơn và hợp đồng ngay trên dashboard tenant." 
            : "Mình đã nhận câu hỏi. Bạn có thể quản lý chủ trọ và cài đặt hệ thống tại dashboard admin.";

      pushHistory(currentUser.id, "user", message);
      pushHistory(currentUser.id, "assistant", reply);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            message,
            reply,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
      temperature: 0.4,
    });

    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");

    if (lastUserMessage && Array.isArray(lastUserMessage.content)) {
      const text = lastUserMessage.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ")
        .trim();

      if (text) {
        pushHistory(currentUser.id, "user", text);
      }
    }

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
