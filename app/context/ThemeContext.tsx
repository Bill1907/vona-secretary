import React, { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 클라이언트 사이드에서 초기 테마 값을 가져오는 함수
const getInitialTheme = (): Theme => {
  // 서버 사이드 렌더링인 경우 기본값으로 light 반환
  if (typeof window === "undefined") return "light";

  try {
    // 로컬 스토리지에 저장된 테마 확인
    const savedTheme = localStorage.getItem("theme") as Theme;

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    // 시스템 설정 확인
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  } catch (err) {
    // 오류 발생 시 기본값으로 light 반환
    return "light";
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 항상 'light'로 시작하고 클라이언트 사이드에서 실제 테마로 업데이트
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setMounted(true);
    // 실제 테마 설정 가져와서 상태 업데이트
    setTheme(getInitialTheme());
  }, []);

  // 테마 변경 시 로컬 스토리지에 저장하고 DOM 업데이트
  useEffect(() => {
    // 마운트 전이거나 SSR 환경이면 아무것도 하지 않음
    if (!mounted || typeof window === "undefined") return;

    try {
      localStorage.setItem("theme", theme);
    } catch (err) {
      console.error("Could not save theme to localStorage:", err);
    }

    // HTML 문서에 다크 모드 클래스 적용
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, mounted]);

  // 테마 전환 함수
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 커스텀 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
