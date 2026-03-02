"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MessageList } from "@/components/chat/message-list";
import { InputArea } from "@/components/chat/input-area";
import { QuickQuestions } from "@/components/chat/quick-questions";
import { MOCK_CHAT_HISTORY } from "@/lib/mock-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleSendMessage = async (content: string) => {
    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // AI応答のシミュレーション
    try {
      // 実際にはAPIを呼び出す
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `「${content}」についてのご質問ですね。\n\n申し訳ありませんが、現在はデモモードのため実際の回答生成は行われません。\n次回以降の実装フェーズでGemini APIと連携し、詳細な回答を提供できるようになります。\n\nお急ぎの場合は、上部メニューの「問い合わせ」からサポート担当者へご連絡ください。`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto bg-white shadow-sm my-4 rounded-lg">
        <MessageList messages={messages} isLoading={isLoading} onQuickQuestionSelect={handleSendMessage} />
        
        <div className="p-4 bg-gray-50 border-t space-y-4">
          {/* QuickQuestionsはMessageList内に移動したため削除 */}
          <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
