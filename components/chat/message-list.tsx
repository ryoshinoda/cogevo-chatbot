import React from "react";
import { cn } from "@/lib/utils";
import { Pentagon, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onQuickQuestionSelect?: (question: string) => void;
}

const QUICK_QUESTIONS = [
  "使い方がわからない",
  "エラーが表示された",
  "パスワードを忘れた",
  "問い合わせ先を知りたい",
];

export function MessageList({ messages, isLoading, onQuickQuestionSelect }: MessageListProps) {
  // 自動スクロール用のrefは親またはここで管理する想定
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
          <Pentagon className="h-12 w-12 text-gray-300" />
          <div>
            <p className="text-lg font-medium">どのようなことにお困りですか？</p>
            <p className="text-sm mb-4">「画面が動かない」「パスワードを忘れた」など<br/>簡単な言葉で話しかけてください。</p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md mx-auto">
              {QUICK_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-white text-xs text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => onQuickQuestionSelect?.(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex w-full max-w-3xl mx-auto gap-3",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.role === "assistant" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Pentagon className="h-5 w-5 text-[#007AFF]" />
            </div>
          )}
          
          <div
            className={cn(
              "rounded-lg px-4 py-3 max-w-[80%] text-sm leading-relaxed shadow-sm",
              message.role === "user"
                ? "bg-[#007AFF] text-white"
                : "bg-white border border-gray-100 text-gray-800"
            )}
          >
            {message.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i !== message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          {message.role === "user" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex w-full max-w-3xl mx-auto gap-3 justify-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Pentagon className="h-5 w-5 text-[#007AFF]" />
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
