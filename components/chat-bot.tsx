"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function ChatBot() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = input.trim();
    if (!value || isLoading) {
      return;
    }

    setInput("");
    await sendMessage({ text: value });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-125 max-h-[80vh] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-sm">AI Support Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded-md transition-colors"
              aria-label="Đóng chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-muted/30 space-y-4 text-sm">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10">
                <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Xin chào, tôi có thể hỗ trợ gì cho bạn hôm nay?</p>
              </div>
            ) : (
              messages.map((message) => {
                const text = getMessageText(message);

                if (message.role === "system" || !text) {
                  return null;
                }

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role !== "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                        message.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-card border border-border text-card-foreground rounded-tl-sm"
                      }`}
                    >
                      {text}
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex gap-2 items-center text-muted-foreground text-xs">
                <Bot className="w-4 h-4 animate-pulse" /> AI đang phản hồi...
              </div>
            )}

            {error && !isLoading && (
              <p className="text-xs text-red-600">Không thể gửi tin nhắn lúc này. Vui lòng thử lại.</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="p-3 bg-card border-t border-border">
            <div className="flex items-center gap-2 relative">
              <input
                className="flex-1 bg-muted border border-transparent focus:border-blue-500 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none transition-colors"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                aria-label="Gửi"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
          aria-label="Mở chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
