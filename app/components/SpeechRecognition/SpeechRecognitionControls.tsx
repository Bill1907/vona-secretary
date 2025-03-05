import React from "react";
import { Button } from "~/components/ui/button";
import { useLanguage } from "~/context/LanguageContext";
import { Mic, Square } from "lucide-react";

interface SpeechRecognitionControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

const SpeechRecognitionControls: React.FC<SpeechRecognitionControlsProps> = ({
  isRecording,
  onStart,
  onStop,
}) => {
  const { t } = useLanguage();

  return (
    <div className="controls flex flex-wrap gap-4 items-center">
      <Button
        onClick={onStart}
        disabled={isRecording}
        className="flex items-center gap-2 min-w-[140px]"
        variant="default"
        size="lg"
      >
        <Mic className="w-5 h-5" />
        {t.startRecognition}
      </Button>

      <Button
        onClick={onStop}
        disabled={!isRecording}
        variant="destructive"
        size="lg"
        className="flex items-center gap-2 min-w-[140px]"
      >
        <Square className="w-5 h-5" />
        {t.stopRecognition}
      </Button>
    </div>
  );
};

export default SpeechRecognitionControls;
