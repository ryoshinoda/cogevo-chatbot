"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function InquiryPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      facility_name: formData.get("facility"),
      person_name: formData.get("name"),
      contact_info: `Email: ${formData.get("email")}, Phone: ${formData.get("phone")}`,
      inquiry_body: formData.get("content"),
    };

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert(data.error || "送信に失敗しました。");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 container max-w-2xl py-12 px-4">
          <Card className="text-center p-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl mb-4">送信が完了しました</CardTitle>
            <CardDescription className="mb-8 text-base">
              お問い合わせありがとうございます。<br />
              担当者が内容を確認し、通常3営業日以内にご連絡いたします。
            </CardDescription>
            <Button asChild>
              <Link href="/chat">チャットに戻る</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container max-w-2xl py-8 px-4">
        <div className="mb-6">
          <Link href="/chat" className="text-sm text-blue-600 hover:underline">
            ← チャットに戻る
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-5 w-5 text-[#007AFF]" />
              <CardTitle>お問い合わせフォーム</CardTitle>
            </div>
            <CardDescription>
              AIで解決しなかった場合は、こちらから担当者へ直接ご連絡いただけます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="facility" className="text-sm font-medium">
                  施設名 <span className="text-red-500">*</span>
                </label>
                <Input id="facility" name="facility" required placeholder="例: ケアセンター未来" />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  ご担当者名 <span className="text-red-500">*</span>
                </label>
                <Input id="name" name="name" required placeholder="例: 山田 花子" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <Input id="phone" name="phone" type="tel" required placeholder="例: 03-1234-5678" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <Input id="email" name="email" type="email" required placeholder="例: example@co.jp" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  placeholder="お困りの状況を詳しくご記入ください..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "送信中..." : "送信する"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
