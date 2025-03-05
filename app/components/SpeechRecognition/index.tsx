import React, { useState, useEffect } from "react";
import useSpeechRecognition, {
  SupportedLanguage,
} from "../../hooks/useSpeechRecognition";
import StatusIndicator from "./StatusIndicator";
import TranscriptDisplay from "./TranscriptDisplay";
import SpeechRecognitionControls from "./SpeechRecognitionControls";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { useLanguage } from "~/context/LanguageContext";
import { Info } from "lucide-react";

const SpeechRecognition = () => {
  const { t, recognitionLang } = useLanguage();

  const { isRecording, status, transcript, startRecognition, stopRecognition } =
    useSpeechRecognition(recognitionLang as SupportedLanguage);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <SpeechRecognitionControls
          isRecording={isRecording}
          onStart={startRecognition}
          onStop={stopRecognition}
        />
        <div className="mt-3">
          <StatusIndicator status={status} />
        </div>
      </div>

      <TranscriptDisplay
        final={transcript.final}
        interim={transcript.interim}
      />

      <Card className="bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-900 transition-colors duration-300">
        <CardContent className="p-4">
          <h3 className="font-bold mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <Info className="w-5 h-5" />
            {t.howToUse}
          </h3>
          <ol className="list-decimal pl-5 space-y-1 text-indigo-900 dark:text-indigo-300">
            <li>{t.clickMicButton}</li>
            <li>{t.speakNow}</li>
            <li>{t.clickStopButton}</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechRecognition;
