export const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    title: "CogEvo利用マニュアル",
    content: "CogEvoを利用する際の基本的な手順について...",
    metadata: { source: "manual.pdf", date: "2024-01-01" },
  },
  {
    id: "doc-2",
    title: "よくある質問集",
    content: "Q: ログインできない場合は？ A: パスワードの再設定を行ってください...",
    metadata: { source: "faq.md", date: "2024-02-01" },
  },
];

// export const MOCK_QUICK_QUESTIONS = [
//   "使い方がわからない",
//   "エラーが表示された",
//   "パスワードを忘れた",
//   "問い合わせ先を知りたい",
// ];

export const MOCK_CHAT_HISTORY = [
  {
    id: "msg-1",
    role: "assistant",
    content: "こんにちは！CogEvoサポートAIです。どのようなことでお困りですか？",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "msg-2",
    role: "user",
    content: "画面がフリーズしてしまいました。",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: "msg-3",
    role: "assistant",
    content: "大変申し訳ございません。画面がフリーズしてしまったとのことですね。まずはブラウザの再読み込みをお試しいただけますでしょうか？",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
];
