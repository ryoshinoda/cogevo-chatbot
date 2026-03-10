"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef(input);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'ja-JP';

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("お使いのブラウザは音声入力に対応していません。");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      const initialInput = inputRef.current;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const space = initialInput && !initialInput.endsWith(' ') && !initialInput.endsWith('　') ? ' ' : '';
        const newText = initialInput + space + finalTranscript + interimTranscript;
        setInput(newText);
      };

      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
      if (isRecording) {
        recognitionRef.current?.stop();
      }
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
            className={`flex-shrink-0 h-10 w-10 ${isRecording ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600' : ''}`}
            onClick={toggleRecording}
            disabled={isLoading}
            title={isRecording ? "音声入力を停止" : "音声入力を開始"}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5 animate-pulse" />
            ) : (
              <Mic className="h-5 w-5 text-gray-500" />
            )}
          </Button>
          
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "音声を聞き取っています..." : "質問を入力してください..."}
              className={`min-h-[44px] max-h-[120px] py-3 pr-10 resize-none ${isRecording ? 'border-red-300 ring-1 ring-red-300' : ''}`}
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
