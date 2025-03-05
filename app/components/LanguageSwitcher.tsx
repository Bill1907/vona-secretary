import React from "react";
import { useLanguage } from "~/context/LanguageContext";
import { SupportedLocale } from "~/lib/i18n";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTheme } from "~/context/ThemeContext";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const { theme } = useTheme();

  const toggleLanguage = () => {
    const newLocale: SupportedLocale = locale === "ko" ? "en" : "ko";
    setLocale(newLocale);
  };

  // 다크 모드에서 배지 스타일 다르게 적용
  const getBadgeVariant = () => {
    if (theme === "dark") {
      return "outline";
    }
    return "secondary";
  };

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
          variant={getBadgeVariant()}
          className="ml-1 text-xs dark:text-gray-300"
        >
          {locale === "ko" ? "KO" : "EN"}
        </Badge>
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
