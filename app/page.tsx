"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pentagon } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "認証中..." : "ログイン"}
    </Button>
  );
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Pentagon className="h-6 w-6 text-[#007AFF]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#007AFF]">CogEvo サポートAI</CardTitle>
          <CardDescription>
            社内・特約店向け問い合わせ対応チャットボット
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={clientAction} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="アクセスパスワードを入力"
                required
                className="text-center text-lg"
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md text-center">
                {error}
              </div>
            )}
            <SubmitButton />
          </form>
          <div className="mt-6 text-center text-xs text-gray-400 space-y-2">
            <div>
              <p>※本システムは社内関係者専用です。</p>
              <p>パスワードが不明な場合は管理者にお問い合わせください。</p>
            </div>
            <div>
              <Link href="/disclaimer" className="text-[#007AFF] hover:underline">免責事項</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
