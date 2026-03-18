"use client";

import { useCompletion } from "@ai-sdk/react";
import { Bot, Loader2, Sparkles } from "lucide-react";

interface AIOverviewProps {
  stats: Record<string, unknown> | null;
}

export function AIOverview({ stats }: AIOverviewProps) {
  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/overview",
    streamProtocol: "text",
  });

  if (!stats) return null;

  return (
    <div className="p-4 mb-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold text-sm">AI Insight Overview</h3>
        </div>

        {!completion && !isLoading && (
          <button
            onClick={() => {
              void complete("", { body: { stats } });
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Tạo AI Insight
          </button>
        )}
      </div>
      
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed min-h-10">
        {isLoading && !completion ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI đang phân tích dữ liệu dashboard...</span>
          </div>
        ) : error ? (
          <p>Không thể tạo tóm tắt AI lúc này.</p>
        ) : !completion ? (
          <p className="text-gray-500 italic">Nhấn nút để tạo tóm tắt AI cho dashboard.</p>
        ) : (
          <p>{completion}</p>
        )}
      </div>
    </div>
  );
}