"use client";

import { Button } from "@/components/ui/button";

interface QuickQuestionsProps {
  onSelect: (question: string) => void;
  isLoading?: boolean;
}

export function QuickQuestions({ onSelect, isLoading }: QuickQuestionsProps) {
  // 表示したくない場合は何もレンダリングしない
  return null;

  /* 元の実装
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex space-x-2 px-4 max-w-3xl mx-auto">
        {MOCK_QUICK_QUESTIONS.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="whitespace-nowrap rounded-full bg-white text-xs text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            onClick={() => onSelect(question)}
            disabled={isLoading}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
  */
}
