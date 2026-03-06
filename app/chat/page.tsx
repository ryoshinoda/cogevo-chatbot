"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Header } from "@/components/layout/header";
import { MessageList } from "@/components/chat/message-list";
import { InputArea } from "@/components/chat/input-area";

export default function ChatPage() {
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSendMessage = (content: string) => {
    sendMessage({
      role: 'user',
      content: content,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto bg-white shadow-sm my-4 rounded-lg">
        <MessageList messages={messages} isLoading={isLoading} onQuickQuestionSelect={handleSendMessage} />
        
        <div className="p-4 bg-gray-50 border-t space-y-4">
          <InputArea 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        </div>
      </main>
    </div>
  );
}
