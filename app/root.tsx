import type { LinksFunction } from "@remix-run/cloudflare";
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

// 페이지 로드 전에 테마 설정을 적용하는 인라인 스크립트
const themeInitializerScript = `
  (function() {
    function getThemePreference() {
      let theme;
      try {
        theme = localStorage.getItem('theme');
      } catch (error) {
        return 'light';
      }
      if (theme === 'dark' || theme === 'light') {
        return theme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    const theme = getThemePreference();
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  })();
`;

// 페이지 로드 전에 언어 설정을 적용하는 인라인 스크립트
const languageInitializerScript = `
  (function() {
    function getLanguagePreference() {
      let locale;
      try {
        locale = localStorage.getItem('app-locale');
      } catch (error) {
        return getBrowserLanguage();
      }
      if (locale === 'ko' || locale === 'en') {
        return locale;
      }
      return getBrowserLanguage();
    }

    function getBrowserLanguage() {
      const browserLang = navigator.language.split('-')[0];
      return browserLang === 'ko' ? 'ko' : 'en';
    }

    const locale = getLanguagePreference();
    const html = document.documentElement;
    html.setAttribute('lang', locale);
  })();
`;

// 아이콘 깜박임 방지를 위한 스타일
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

// 메타 정보 다국어 처리를 위한 스크립트
const metaLocalizationScript = `
  (function() {
    try {
      const locale = localStorage.getItem('app-locale') || 'ko';
      const metaTitles = {
        ko: 'Easylog - 음성 메모 도구',
        en: 'Easylog - Voice Memo Tool'
      };
      const metaDescriptions = {
        ko: '음성을 텍스트로 변환하여 메모를 쉽게 작성할 수 있는 도구입니다.',
        en: 'A tool that converts speech to text for easy note-taking.'
      };
      
      // 타이틀 업데이트
      document.title = metaTitles[locale] || metaTitles.ko;
      
      // 메타 설명 업데이트
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', metaDescriptions[locale] || metaDescriptions.ko);
      }
    } catch (e) {
      console.error('Error updating meta information:', e);
    }
  })();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: iconPreloadStyles }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
        <script
          dangerouslySetInnerHTML={{ __html: languageInitializerScript }}
        />
        <script dangerouslySetInnerHTML={{ __html: metaLocalizationScript }} />
      </head>
      <body className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {children}
        <Toaster position="top-center" closeButton />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Outlet />
      </LanguageProvider>
    </ThemeProvider>
  );
}
