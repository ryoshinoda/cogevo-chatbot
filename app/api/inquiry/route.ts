import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resendの初期化
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { facility_name, person_name, contact_info, inquiry_body } = body;

    // バリデーション
    if (!facility_name || !person_name || !contact_info || !inquiry_body) {
      return NextResponse.json(
        { success: false, error: "必須項目が入力されていません。" },
        { status: 400 }
      );
    }

    // メール送信
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // 認証済みドメインがない場合はこれを使用
      to: process.env.NOTIFICATION_EMAIL || "ryo.shinoda@tbc410.com", // 通知先メールアドレス
      subject: `【お問い合わせ】${facility_name} - ${person_name}様`,
      text: `
施設名: ${facility_name}
ご担当者名: ${person_name}
連絡先: ${contact_info}

お問い合わせ内容:
${inquiry_body}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, error: "メール送信に失敗しました。時間をおいて再度お試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "問い合わせを受け付けました。",
    });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
