# API仕様書

## 1. 目的
本ドキュメントは、「Inquiry Chatbot」システムのバックエンドAPIの仕様を定義し、フロントエンドとバックエンドの通信インターフェースを明確にすることを目的とします。

## 2. 設計原則
-   **アーキテクチャスタイル**: RESTful APIの原則に基づき設計します。ただし、Next.js Server Actionsの利用を前提とし、一部は関数呼び出しの形式で実装される場合があります。
-   **通信プロトコル**: HTTPS (HTTP/1.1 or HTTP/2) を必須とします。
-   **データフォーマット**: リクエスト/レスポンス共にJSON形式を基本とします。ただし、ストリーミングレスポンスの場合はText Stream形式となります。
-   **ステータスコード**: HTTPステータスコード (200, 400, 401, 500等) を適切に使用します。
-   **エラーハンドリング**: エラー発生時は、エラーコードとメッセージを含むJSONレスポンスを返却します。

## 3. 認証・認可
-   **認証方式**: 共通パスワードによる簡易認証を採用します。
    -   クライアントはリクエストヘッダーまたはCookieに認証トークン（ハッシュ化されたパスワード等）を含めて送信します。
    -   サーバーサイド（Middleware）でトークンを検証し、不正な場合は `401 Unauthorized` を返却します。
-   **認可スコープ**: 全ユーザーが同一の権限（チャット利用、問い合わせ送信）を持ちます。管理者機能は本APIスコープ外（別途実装検討）とします。

## 4. エンドポイント一覧

### 4.1 チャット回答生成

ユーザーの質問に対して、RAG検索を行い、AIによる回答をストリーミング形式で返却します。

-   **エンドポイント**: `POST /api/chat`
-   **概要**: チャットメッセージを送信し、AIからの回答を取得する。
-   **認証**: 必須

#### リクエスト

```json
{
  "messages": [
    {
      "role": "user",
      "content": "ログインできません"
    },
    {
      "role": "assistant",
      "content": "どのようなエラーメッセージが表示されますか？"
    },
    {
      "role": "user",
      "content": "「パスワードが違います」と出ます"
    }
  ],
  "stream": true
}
```

| パラメータ | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| **messages** | `Array<Message>` | Yes | 会話履歴を含むメッセージオブジェクトの配列。`role` (user/assistant/system) と `content` を持つ。 |
| **stream** | `boolean` | No | Default: `true`。ストリーミングレスポンスを有効にするフラグ。 |

#### レスポンス (正常系 - Streaming)

Server-Sent Events (SSE) 形式で、生成されたテキストトークンを逐次送信します。

```text
data: "パス"
data: "ワード"
data: "の"
data: "再"
data: "設定"
...
```

#### レスポンス (正常系 - Non-Streaming)

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "パスワードの再設定手順をご案内します..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 56,
    "completion_tokens": 31,
    "total_tokens": 87
  }
}
```

#### エラーレスポンス

```json
{
  "error": {
    "code": "context_length_exceeded",
    "message": "The context length exceeds the limit."
  }
}
```

### 4.2 問い合わせ送信

AIチャットボットで解決しなかった場合に、サポート担当者へメールで問い合わせを送信します。

-   **エンドポイント**: `POST /api/inquiry` (または Server Action `submitInquiry`)
-   **概要**: 問い合わせフォームの内容を受け取り、メール送信サービス経由で通知する。
-   **認証**: 必須

#### リクエスト

```json
{
  "facility_name": "あおぞら介護施設",
  "person_name": "山田 花子",
  "contact_info": "03-1234-5678",
  "inquiry_body": "タブレットの電源が入りません。充電しても反応がないです。"
}
```

| パラメータ | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| **facility_name** | `string` | Yes | 施設名。 |
| **person_name** | `string` | Yes | 担当者名。 |
| **contact_info** | `string` | Yes | 電話番号またはメールアドレス。 |
| **inquiry_body** | `string` | Yes | 問い合わせ内容本文。 |

#### レスポンス (正常系)

```json
{
  "success": true,
  "message": "問い合わせを受け付けました。"
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": "メール送信に失敗しました。時間をおいて再度お試しください。"
}
```

### 4.3 ログ保存 (Internal Use)

チャットのやり取りをデータベースに保存するための内部API（またはServer Action内で実行）。

-   **エンドポイント**: (Internal Function) `saveChatLog`
-   **概要**: ユーザーの質問とAIの回答ペアを `chat_logs` テーブルに保存する。
-   **トリガー**: `POST /api/chat` の完了時、または `POST /api/feedback` 呼び出し時。

### 4.4 フィードバック送信

回答に対する「役に立った / 役に立たなかった」のフィードバックを保存します。

-   **エンドポイント**: `POST /api/feedback`
-   **概要**: 特定の回答に対するユーザー評価を記録する。
-   **認証**: 必須

#### リクエスト

```json
{
  "chat_log_id": "uuid-1234-5678",
  "is_helpful": true
}
```

| パラメータ | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| **chat_log_id** | `string` | Yes | 評価対象のチャットログID。 |
| **is_helpful** | `boolean` | Yes | `true`: 解決した, `false`: 解決しない。 |

#### レスポンス

```json
{
  "success": true
}
```
