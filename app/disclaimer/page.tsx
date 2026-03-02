import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Link>
        
        <Card className="w-full shadow-md">
          <CardHeader className="space-y-1 text-center border-b pb-6 bg-white rounded-t-xl">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <ShieldAlert className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">免責事項</CardTitle>
            <CardDescription className="text-base mt-2">
              CogEvo サポートAI（社内・特約店向け）をご利用いただくにあたり、以下の内容を必ずご確認ください。
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-8 space-y-8 bg-white text-gray-700">
            <section className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 border-l-4 border-[#007AFF] pl-3">
                1. AIによる回答の正確性について
              </h3>
              <p className="pl-4">
                本システムは、生成AIを利用して回答を作成しています。AIの性質上、回答内容の正確性、完全性、最新性、有用性を保証するものではありません。出力された情報は、必ず社内資料や公式マニュアル等で事実確認を行った上でご活用ください。
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 border-l-4 border-[#007AFF] pl-3">
                2. 医療機器および薬機法に関する免責事項
              </h3>
              <p className="pl-4">
                「CogEvo」は医療機器ではありません。本システムが提供する情報およびCogEvoの機能は、疾病の診断、治療、予防を目的とするものではなく、またそれらに代わるものでもありません。医学的な判断が必要な場合は、必ず専門の医療機関にご相談ください。
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 border-l-4 border-[#007AFF] pl-3">
                3. 損害賠償の免責
              </h3>
              <p className="pl-4">
                本システムを利用したこと、または利用できなかったことによって生じた直接的、間接的、偶発的、派生的な損害（データの消失、業務の遅延、利益の損失等を含む）について、株式会社トータルブレインケアは一切の責任を負いません。
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 border-l-4 border-[#007AFF] pl-3">
                4. サービスの変更・停止
              </h3>
              <p className="pl-4">
                本システムは、保守点検、アップデート、またはその他のやむを得ない事由により、ユーザーへ事前に通知することなく、サービスの一部または全部を変更、一時停止、または終了する場合があります。
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 border-l-4 border-[#007AFF] pl-3">
                5. 情報の取り扱い
              </h3>
              <p className="pl-4">
                本システムに入力された情報は、AIの学習や回答生成のために処理される場合があります。個人情報や機密性の高い情報（患者情報、顧客の個人情報、未公開の経営情報など）は絶対に入力しないでください。
              </p>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center border-t pt-6 pb-8 bg-gray-50 rounded-b-xl">
            <p className="text-sm text-gray-500 mb-6">
              上記の内容に同意の上、本システムをご利用ください。
            </p>
            <div className="font-medium text-gray-800">
              株式会社トータルブレインケア
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
