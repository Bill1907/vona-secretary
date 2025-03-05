import React, { useEffect, useState } from "react";
import { useTheme } from "~/context/ThemeContext";
import { Button } from "~/components/ui/button";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 마운트 상태 업데이트
  useEffect(() => {
    setMounted(true);
  }, []);

  // 컴포넌트가 마운트되기 전에는 기본 아이콘만 렌더링
  // 이는 서버 사이드 렌더링과 클라이언트 사이드 렌더링의 일관성을 보장합니다
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-9 h-9"
        aria-label="Theme toggle"
      >
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className="rounded-full w-9 h-9"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-600" />
      )}
    </Button>
  );
};

export default ThemeToggle;
