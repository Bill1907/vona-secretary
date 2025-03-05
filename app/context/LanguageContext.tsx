import React, { createContext, useState, useContext, useEffect } from "react";
import {
  SupportedLocale,
  translationsByLocale,
  Translations,
  recognitionLangToLocale,
  localeToRecognitionLang,
} from "~/lib/i18n";

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: Translations;
  recognitionLang: string;
  setRecognitionLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// 브라우저 언어 설정을 감지하는 함수
const getBrowserLocale = (): SupportedLocale => {
  if (typeof window === "undefined") return "ko"; // 서버 사이드에서는 기본값 반환

  const browserLang = navigator.language.split("-")[0];
  return browserLang === "ko" ? "ko" : "en";
};

// 초기 언어 설정을 가져오는 함수
const getInitialLocale = (): SupportedLocale => {
  if (typeof window === "undefined") return "ko"; // 서버 사이드에서는 기본값 반환

  try {
    const savedLocale = localStorage.getItem("app-locale") as SupportedLocale;
    if (savedLocale === "ko" || savedLocale === "en") {
      return savedLocale;
    }
    return getBrowserLocale();
  } catch (err) {
    return "ko"; // 오류 발생 시 기본값으로 한국어 반환
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 서버 사이드 렌더링을 위해 항상 기본값으로 시작
  const [locale, setLocale] = useState<SupportedLocale>("ko");
  const [recognitionLang, setRecognitionLang] = useState<string>("ko-KR");
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 실행되는 초기화
  useEffect(() => {
    setMounted(true);
    const initialLocale = getInitialLocale();
    setLocale(initialLocale);
    setRecognitionLang(localeToRecognitionLang[initialLocale]);
  }, []);

  // 언어 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    try {
      localStorage.setItem("app-locale", locale);

      // html 언어 속성도 업데이트
      document.documentElement.setAttribute("lang", locale);
    } catch (err) {
      console.error("Could not save locale to localStorage:", err);
    }
  }, [locale, mounted]);

  // 음성 인식 언어 변경 시 UI 언어도 함께 변경
  const handleRecognitionLangChange = (lang: string) => {
    setRecognitionLang(lang);
    if (recognitionLangToLocale[lang]) {
      setLocale(recognitionLangToLocale[lang]);
    }
  };

  // UI 언어 변경 시 음성 인식 언어도 함께 변경
  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setRecognitionLang(localeToRecognitionLang[newLocale]);
  };

  // 현재 선택된 언어의 번역 리소스
  const t = translationsByLocale[locale];

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale: handleLocaleChange,
        t,
        recognitionLang,
        setRecognitionLang: handleRecognitionLangChange,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// 커스텀 훅으로 컨텍스트 쉽게 사용
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
