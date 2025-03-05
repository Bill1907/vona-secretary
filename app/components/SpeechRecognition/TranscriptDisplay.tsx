import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "~/context/LanguageContext";
import { FileText, Mic, CheckCheck, Copy } from "lucide-react";

interface TranscriptDisplayProps {
  final: string;
  interim: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  final,
  interim,
}) => {
  const { t } = useLanguage();

  // 복사 성공 상태 관리
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // 복사 성공 메시지 타이머 관리
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copySuccess) {
      timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [copySuccess]);

  // 텍스트 복사 함수
  const handleCopyText = async () => {
    const textToCopy = `${final}${interim ? ` ${interim}` : ""}`.trim();

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);

      // 토스트 알림 표시
      toast.success(t.copySuccess, {
        description:
          textToCopy.length > 50
            ? `${textToCopy.substring(0, 50)}...`
            : textToCopy,
        duration: 3000,
      });

      console.log("텍스트가 클립보드에 복사되었습니다.");
    } catch (err) {
      console.error("텍스트 복사 중 오류 발생:", err);

      // 오류 토스트 알림
      toast.error(t.copyError, {
        description: "다시 시도해주세요",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm dark:border-gray-700 transition-colors duration-300">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-3 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <CardTitle className="text-lg dark:text-white">
            {t.transcriptTitle}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="transcript-box p-4 min-h-[200px] bg-white dark:bg-gray-900 break-words whitespace-pre-wrap transition-colors duration-300">
          {final && (
            <div className="final-text leading-relaxed mb-3 dark:text-white">
              {final}
            </div>
          )}

          {interim && (
            <div className="interim-text text-gray-500 dark:text-gray-400 italic border-l-2 border-indigo-200 dark:border-indigo-700 pl-2 leading-relaxed">
              {interim}
            </div>
          )}

          {!final && !interim && (
            <div className="empty-state flex flex-col items-center justify-center h-[150px] text-gray-400 dark:text-gray-500">
              <Mic className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
              <p>{t.emptyTranscriptMessage}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 py-2 px-4 flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {final || interim ? t.autoSaveMessage : ""}
        </div>
        {(final || interim) && (
          <button
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm flex items-center"
            onClick={handleCopyText}
            aria-label={t.copy}
            title={t.copySuccess}
          >
            {copySuccess ? (
              <>
                <CheckCheck className="w-4 h-4 mr-1 text-green-500 dark:text-green-400" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                {t.copy}
              </>
            )}
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TranscriptDisplay;
