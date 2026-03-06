# システムアーキテクチャ設計書

## 1. 目的
本ドキュメントは、「Inquiry Chatbot」システム全体の技術構成、コンポーネント間の連携、およびフロントエンドのコンポーネント設計を明確にすることを目的とします。

## 2. 技術スタック

本プロジェクトでは、以下の技術スタックを採用します。選定理由は、開発効率、パフォーマンス、およびスケーラビリティを重視しています。

| カテゴリ | 技術 | 選定理由 |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router)** | SEO対策、サーバーサイドレンダリングによるパフォーマンス向上、最新のReact機能（RSC）の活用が可能。 |
| | **TypeScript** | 静的型付けによる開発効率向上とバグ削減。 |
| | **React** | コンポーネント指向によるUI構築の効率化。 |
| | **Tailwind CSS** | ユーティリティファーストなCSSフレームワークによる迅速なスタイリング。 |
| **Backend** | **Next.js Route Handlers** | Next.jsに統合されたバックエンド機能により、別途バックエンドサーバーを構築する必要がない。Server Actionsによるデータ取得・更新の簡略化。 |
| **Database** | **Supabase** | PostgreSQLベースのBaaS。pgvector拡張によるベクトル検索の容易さ、認証・ログ保存の手軽さ。 |
| **AI / LLM** | **OpenAI API** | 高速かつ低コストな生成AIモデル（gpt-4o-mini推奨）。マルチモーダル対応の可能性。 |
| | **OpenAI Platform** | プロンプトエンジニアリングとモデル調整環境。 |
| **Auth** | **簡易認証 (Middleware)** | 環境変数を用いた共通パスワードによるアクセス制限。MVP段階での実装コスト削減。 |
| **Hosting** | **Vercel** | Next.jsの開発元によるホスティングサービス。設定不要で最適化されたデプロイ環境を提供。 |
| **Email** | **Resend** | 開発者フレンドリーなメール配信API。Vercelとの親和性が高い。 |

## 3. アーキテクチャ概要

システム全体のアーキテクチャは以下の通りです。

```mermaid
graph TD
    User[ユーザー (Browser)] -->|HTTPS| Vercel[Vercel (Next.js)]
    subgraph Vercel
        Middleware[Auth Middleware]
        Page[React Components]
        API[API Routes / Server Actions]
    end
    API -->|Generate| OpenAI[OpenAI API]
    API -->|Search/Log| Supabase[Supabase (DB)]
    API -->|Send Mail| Resend[Email Service]
    Admin[管理者] -->|Data Import| Supabase
```

### コンポーネントの役割

-   **User (Browser)**: ユーザーが利用するWebブラウザ。チャットUIの表示や音声入力を行います。
-   **Vercel (Next.js)**: アプリケーションのホスティング環境および実行基盤。
    -   **Auth Middleware**: リクエストごとに共通パスワードによる認証状態をチェックし、未認証の場合はログイン画面へリダイレクトします。
    -   **React Components**: ユーザーインターフェースを構成するコンポーネント群。
    -   **API Routes / Server Actions**: バックエンドロジックを実行し、外部サービス（OpenAI, Supabase, Resend）と連携します。
-   **OpenAI API**: ユーザーの質問に対する回答生成およびテキストのベクトル化（Embedding）を行います。
-   **Supabase (DB)**: ドキュメントのベクトルデータ、チャットログなどを保存するデータベースです。
-   **Resend**: 問い合わせフォームからのメール送信を処理します。
-   **Admin (管理者)**: ドキュメントの更新やログの確認を行う管理者です（現状は直接DB操作やスクリプト実行を想定）。

## 4. コンポーネント設計

Next.js App RouterのServer ComponentsとClient Componentsの役割分担に基づいた設計を行います。

### 4.1 コンポーネント階層図

```mermaid
graph TD
    Layout[layout.tsx (Server)] --> Page[page.tsx (Server)]
    Page --> AuthCheck[AuthCheck (Server/Middleware)]
    Page --> Header[Header (Client)]
    Page --> ChatContainer[ChatContainer (Client)]
    
    ChatContainer --> MessageList[MessageList (Client)]
    MessageList --> MessageItem[MessageItem (Client)]
    
    ChatContainer --> InputArea[InputArea (Client)]
    InputArea --> MicButton[MicButton (Client)]
    InputArea --> SendButton[SendButton (Client)]
    
    ChatContainer --> QuickQuestions[QuickQuestions (Client)]
    
    Page --> Disclaimer[Disclaimer (Server)]
    Page --> Footer[Footer (Server)]
```

### 4.2 主要コンポーネント定義

| コンポーネント名 | 種類 | 役割・機能 | 主なProps / State |
| :--- | :--- | :--- | :--- |
| `layout.tsx` | Server | アプリケーション全体のレイアウト定義（HTML構造、メタデータ、共通スタイル）。 | `children: React.ReactNode` |
| `page.tsx` | Server | チャット画面のルートページ。認証チェック後のメインコンテンツを表示。 | - |
| `ChatContainer` | Client | チャット機能全体の状態管理（メッセージ履歴、入力状態、ローディング状態）。`useChat` フックなどのロジックを統括。 | `initialMessages?: Message[]` |
| `MessageList` | Client | メッセージのリスト表示。スクロール制御。 | `messages: Message[]` |
| `MessageItem` | Client | 個別のメッセージ表示。AI/Userの区別、Markdownレンダリング。 | `message: Message` |
| `InputArea` | Client | テキスト入力エリアと送信ボタン。 | `input: string`, `handleInputChange`, `handleSubmit`, `isLoading` |
| `MicButton` | Client | 音声入力の制御。Web Speech APIの利用。 | `onResult: (text: string) => void` |
| `QuickQuestions` | Client | 頻出質問ボタンのリスト表示。クリックで質問を送信。 | `onSelect: (question: string) => void` |
| `Disclaimer` | Server | 免責事項の表示。静的コンテンツ。 | - |

### 4.3 実装方針

-   **状態管理**: Vercel AI SDKの `useChat` フックを利用し、ストリーミングレスポンスの受信、メッセージ履歴の管理、ローディング状態の管理を簡潔に実装します。
-   **スタイリング**: Tailwind CSSを使用し、レスポンシブデザインに対応します。特にモバイル・タブレットでの操作性を重視します。
-   **音声入力**: ブラウザ標準の Web Speech API (SpeechRecognition) を使用します。非対応ブラウザへのフォールバックやエラーハンドリングを実装します。
