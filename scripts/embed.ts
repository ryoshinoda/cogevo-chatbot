import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// .env.local を読み込む
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// RLSをバイパスするため、Service Role Keyを使用する
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error("必要な環境変数が設定されていません。(.env.localを確認してください)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// テキストをチャンク（意味のある塊）に分割する関数
function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  // ページマーカー（例: -- 1 of 16 --）がある場合は、まずそれで分割する
  const pageRegex = /\n-- \d+ of \d+ --\n/g;
  if (pageRegex.test(text)) {
    const pages = text.split(pageRegex).map(p => p.trim()).filter(p => p.length > 0);
    let allChunks: string[] = [];
    for (const page of pages) {
      if (page.length > maxChunkSize) {
        allChunks.push(...chunkByParagraphs(page, maxChunkSize));
      } else {
        allChunks.push(page);
      }
    }
    return allChunks;
  }

  // それ以外（FAQなど）は段落ごとに分割し、上限サイズに収まるように結合する
  return chunkByParagraphs(text, maxChunkSize);
}

function chunkByParagraphs(text: string, maxChunkSize: number): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

async function processFile(filePath: string, type: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const chunks = chunkText(content, 1000);
  const fileName = path.basename(filePath);

  console.log(`処理中: ${fileName} (${chunks.length} チャンク)...`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // OpenAI APIでテキストのベクトル表現（Embedding）を取得
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk,
    });
    
    const embedding = response.data[0].embedding;
    
    // Supabaseのdocumentsテーブルに保存
    const { error } = await supabase
      .from('documents')
      .insert({
        content: chunk,
        metadata: {
          source: fileName,
          type: type,
          chunk_index: i,
        },
        embedding: embedding,
      });

    if (error) {
      console.error(`エラー: ${fileName} のチャンク ${i} の挿入に失敗しました:`, error);
    }
  }
  console.log(`完了: ${fileName}`);
}

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  
  // 既存のデータをすべて削除（初期化）
  console.log("既存のドキュメントデータを削除しています...");
  await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const categories = [
    { dir: 'manuals', type: 'manual' },
    { dir: 'faq', type: 'faq' }
  ];

  for (const category of categories) {
    const dirPath = path.join(dataDir, category.dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      await processFile(path.join(dirPath, file), category.type);
    }
  }
  
  console.log("すべてのデータの埋め込みと保存が完了しました！");
}

main().catch(console.error);
