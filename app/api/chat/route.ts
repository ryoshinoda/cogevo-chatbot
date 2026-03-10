import { createClient } from '@supabase/supabase-js';
import { openai } from '@ai-sdk/openai';
import { streamText, type UIMessage, convertToModelMessages } from 'ai';

export const maxDuration = 30;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: UIMessage[] };

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const userQuery = lastUserMessage ? getTextFromUIMessage(lastUserMessage) : '';

    // 1. ユーザーの質問をベクトル化
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: userQuery,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`Failed to create embedding: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // 2. Supabaseで類似ドキュメントを検索
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_count: 5,
    });

    if (error) {
      console.error('Supabase search error:', error);
      throw new Error('Failed to search documents');
    }

    // 3. 検索結果をプロンプトのコンテキストとして組み立てる
    const contextText = documents
      .map((doc: any) => `【参考資料: ${doc.metadata.source}】\n${doc.content}`)
      .join('\n\n');

    const systemPrompt = `
あなたは「脳体力トレーナーCogEvo Pro」のカスタマーサポートAIです。
以下の【参考資料】に基づいて、ユーザーの質問に丁寧に、分かりやすく日本語で答えてください。
回答はマークダウン形式で整形し、箇条書きや太字を適切に使って読みやすくしてください。

【ルール】
- 参考資料に記載されている内容のみに基づいて回答してください。
- 参考資料から推測できないことや、不確実な情報については、「申し訳ありませんが、その情報についてはマニュアルに記載がありません。サポート窓口（customer@tbc410.com）までお問い合わせください。」と案内してください。
- ハルシネーション（嘘の回答）は絶対に避けてください。

【エラー対応に関する特別ルール】
ユーザーから「エラーが表示された」などの申告があった場合、エラーの種類（エラー番号やメッセージ）によって以下の通り対応を切り分けてください。

1. 詳細が不明な場合:
   エラー番号やエラーメッセージなどの詳細情報がない場合は、憶測で回答せず、どのようなエラーなのか詳細を必ず聞き返してください。
   例: 「赤い文字でエラー番号は表示されますか？（エラー番号を教えてください）」「エラーメッセージは確認できますか？」など。

2. 500エラーの場合:
   「一度ブラウザまたはパソコンを再起動してお試しください。それでもエラー表示が消えない場合はその旨を[お問い合わせフォーム](/inquiry)よりお伝えください。改めて担当者よりご連絡差し上げます。」と案内し、お問い合わせフォームへ誘導してください。

3. 403または404エラーの場合:
   インターネットや通信に関するエラーの可能性があるため、ご利用のインターネット接続環境（Wi-Fi等）が正常か確認するようお伝えください。

4. その他のエラーメッセージ（例: 一括登録のCSV読み込み時に「サーバーエラーが発生しました」と表示されるなど）の場合:
   提供されている【参考資料】（過去の「よくある質問」など）からそのエラーに関する対応方法を参照し、回答してください。参考資料に対応方法の記載がない場合は、【ルール】に従いサポート窓口へ誘導してください。

【お問い合わせに関する特別ルール】
- ユーザーが「お問い合わせ先を知りたい」などのようにお問い合わせに関する情報を求めている場合は、以下の情報を案内してください：
  - **メールアドレス:** customer@tbc410.com
  - **電話番号(代):** ０７８－３３５－８４６７（土日祝を除く９：３０～１７：００）

【参考資料】
${contextText}
`;

    // 4. UIMessage → ModelMessage に変換して streamText に渡す
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: modelMessages,
      async onFinish({ text }) {
        try {
          await supabase.from('chat_logs').insert({
            user_query: userQuery,
            ai_response: text,
          });
        } catch (e) {
          console.error('Failed to save chat log:', e);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
