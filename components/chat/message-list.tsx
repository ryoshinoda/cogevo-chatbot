import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Pentagon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UIMessage } from "ai";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

interface MessageListProps {
  messages: UIMessage[];
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

      {messages.map((message) => {
        const text = getMessageText(message);
        return (
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
              {message.role === "user" ? (
                <div className="whitespace-pre-wrap">{text}</div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-5" {...props} />,
                    ol: ({ node, ...props }) => <ol className="mb-2 list-decimal pl-5" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-md font-bold mt-3 mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-2" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    code: ({ node, inline, ...props }: any) => 
                      inline ? (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-gray-800" {...props} />
                      ) : (
                        <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto my-2 text-sm text-gray-800">
                          <code {...props} />
                        </pre>
                      ),
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 italic my-2 text-gray-600" {...props} />
                  }}
                >
                  {text}
                </ReactMarkdown>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
        );
      })}

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
