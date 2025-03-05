import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Toaster } from "~/components/ui/sonner";
import { LanguageProvider } from "~/context/LanguageContext";
import { ThemeProvider } from "~/context/ThemeContext";

// 메타 정보 설정 (기본값, 서버와 클라이언트가 일치해야 함)
export const meta: MetaFunction = () => {
  return [
    { title: "Easylog - Voice Memo Tool" },
    {
      name: "description",
      content: "A tool that converts speech to text for easy note-taking.",
    },
  ];
};

// CSS 파일 경로를 직접 지정
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/app/tailwind.css" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// 아이콘 스타일 CSS
const iconPreloadStyles = `
  .lucide {
    width: 1em;
    height: 1em;
    stroke-width: 2;
    stroke: currentColor;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

// Document 컴포넌트 - HTML 구조를 정의
// 하이드레이션 오류 방지를 위해 최소한의 구조로 유지
function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: iconPreloadStyles }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// App 컴포넌트
export default function App() {
  return (
    <Document>
      <ThemeProvider>
        <LanguageProvider>
          <Outlet />
          <Toaster position="top-center" closeButton />
        </LanguageProvider>
      </ThemeProvider>
    </Document>
  );
}
