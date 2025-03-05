import React from "react";
import { Badge } from "~/components/ui/badge";
import { useLanguage } from "~/context/LanguageContext";
import { useTheme } from "~/context/ThemeContext";
import { AlertCircle, Clock, Mic } from "lucide-react";

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // 상태 텍스트 변환
  const getLocalizedStatus = (status: string): string => {
    const lowerStatus = status.toLowerCase();

    if (lowerStatus.includes("대기") || lowerStatus.includes("waiting")) {
      return t.waiting;
    } else if (
      lowerStatus.includes("인식 중") ||
      lowerStatus.includes("listening")
    ) {
      return t.recording;
    } else if (
      lowerStatus.includes("오류") ||
      lowerStatus.includes("error") ||
      lowerStatus.includes("끊김")
    ) {
      return t.connectionError;
    } else if (lowerStatus.includes("종료") || lowerStatus.includes("ended")) {
      return t.recognitionEnded;
    }

    return status;
  };

  // 상태에 따른 배지 변형 결정
  const getBadgeVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline" => {
    const lowerStatus = status.toLowerCase();

    if (
      lowerStatus.includes("오류") ||
      lowerStatus.includes("error") ||
      lowerStatus.includes("끊김")
    ) {
      return "destructive";
    } else if (
      lowerStatus.includes("대기") ||
      lowerStatus.includes("종료") ||
      lowerStatus.includes("waiting") ||
      lowerStatus.includes("ended")
    ) {
      return "secondary";
    } else if (
      (lowerStatus.includes("인식") && lowerStatus.includes("중")) ||
      lowerStatus.includes("listening")
    ) {
      return "default";
    }

    return "outline";
  };

  // 상태에 따른 아이콘 결정
  const getStatusIcon = () => {
    const lowerStatus = status.toLowerCase();

    if (
      lowerStatus.includes("오류") ||
      lowerStatus.includes("error") ||
      lowerStatus.includes("끊김")
    ) {
      return <AlertCircle className="w-4 h-4 mr-1" />;
    } else if (
      (lowerStatus.includes("인식") && lowerStatus.includes("중")) ||
      lowerStatus.includes("listening")
    ) {
      return <Mic className="w-4 h-4 mr-1 animate-pulse" />;
    } else {
      return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  // 다크 모드에서 배지 스타일 조정을 위한 추가 클래스
  const getBadgeClass = () => {
    const baseClass = "flex items-center gap-1 px-2.5 py-1";

    // 다크 모드에서 배지 스타일 조정
    if (theme === "dark") {
      const variant = getBadgeVariant();
      if (variant === "secondary") {
        return `${baseClass} dark:bg-gray-700 dark:text-gray-200`;
      }
    }

    return baseClass;
  };

  return (
    <div className="status flex items-center gap-2 mt-1">
      <Badge variant={getBadgeVariant()} className={getBadgeClass()}>
        {getStatusIcon()}
        {getLocalizedStatus(status)}
      </Badge>
    </div>
  );
};

export default StatusIndicator;
