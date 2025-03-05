interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  error: any;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    ENV?: {
      WS_SERVER_URL?: string;
      [key: string]: string | undefined;
    };
  }
}

export {};
