"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic } from "lucide-react";

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [input, setInput] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="flex-shrink-0 h-10 w-10"
            onClick={() => alert("音声入力機能は現在開発中です")}
            disabled={isLoading}
          >
            <Mic className="h-5 w-5 text-gray-500" />
          </Button>
          
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力してください..."
              className="min-h-[44px] max-h-[120px] py-3 pr-10 resize-none"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="flex-shrink-0 h-10 w-10"
            size="icon"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          AIは不正確な情報を生成する可能性があります。重要な情報は必ず公式マニュアルをご確認ください。
        </p>
      </div>
    </div>
  );
}
