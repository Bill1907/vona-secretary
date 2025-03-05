import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import SpeechRecognition from "~/components/SpeechRecognition";
import { useLanguage } from "~/context/LanguageContext";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => {
  // 메타 정보는 서버 사이드에서 렌더링되므로 useContext를 사용할 수 없음
  // 기본값으로 설정하고 클라이언트에서 동적으로 처리
  return [
    { title: "Easylog" },
    { name: "description", content: "Speech to text memo tool" },
  ];
};

export default function Index() {
  const { t } = useLanguage();

  return (
    <Layout>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t.homeTitle}</CardTitle>
          <CardDescription>{t.homeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <SpeechRecognition />
        </CardContent>
      </Card>
    </Layout>
  );
}

export function ErrorBoundary() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="error-container p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800">
        <p>{t.generalError}</p>
        <Link
          to="/"
          className="text-red-600 dark:text-red-400 underline mt-2 inline-block"
        >
          {t.backToHome}
        </Link>
      </div>
    </Layout>
  );
}
