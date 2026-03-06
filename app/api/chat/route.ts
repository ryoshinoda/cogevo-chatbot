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
