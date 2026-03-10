-- pgvector 拡張機能の有効化（ベクトル検索に必須）
create extension if not exists vector;

-- 1. documents テーブルの作成
create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    metadata jsonb not null default '{}'::jsonb,
    embedding vector(1536) not null
);

-- インデックスの作成 (documents)
-- HNSWインデックス（近似近傍探索を高速化）
create index if not exists documents_embedding_idx on documents using hnsw (embedding vector_cosine_ops);
-- GINインデックス（メタデータによるフィルタリングを高速化）
create index if not exists documents_metadata_idx on documents using gin (metadata);

-- 2. chat_logs テーブルの作成
create table if not exists chat_logs (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    user_query text not null,
    ai_response text not null,
    is_helpful boolean,
    session_id text
);

-- インデックスの作成 (chat_logs)
create index if not exists chat_logs_created_at_idx on chat_logs (created_at);
create index if not exists chat_logs_session_id_idx on chat_logs (session_id);

-- 3. RAG用（類似ドキュメント検索用）の関数作成
-- これにより、ユーザーの質問（をベクトル化したもの）と類似するドキュメントを抽出できます
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 10,
  filter jsonb default '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  -- JSONBに含まれるキー/バリューでフィルタリング（任意）
  where documents.metadata @> filter
  -- コサイン類似度（距離）でソート
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
