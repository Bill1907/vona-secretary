import React, { useState, useEffect } from "react";
import { useLanguage } from "~/context/LanguageContext";
import { SupportedLocale } from "~/lib/i18n";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTheme } from "~/context/ThemeContext";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 마운트 상태 업데이트
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLocale: SupportedLocale = locale === "ko" ? "en" : "ko";
    setLocale(newLocale);
  };

  // 서버 사이드 렌더링과 초기 클라이언트 렌더링을 위한 기본 스타일
  const badgeVariant = mounted && theme === "dark" ? "outline" : "secondary";

  // 마운트 전에는 최소한의 UI로 렌더링
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Globe className="h-4 w-4 mr-1" />
          <span>Language</span>
          <Badge variant="secondary" className="ml-1 text-xs">
            EN
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
        {t.languageSelector}
      </span>
      <Button
        onClick={toggleLanguage}
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Globe className="h-4 w-4 mr-1" />
        <span>{locale === "ko" ? "English" : "한국어"}</span>
        <Badge
          variant={badgeVariant}
          className="ml-1 text-xs dark:text-gray-300"
        >
          {locale === "ko" ? "KO" : "EN"}
        </Badge>
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
