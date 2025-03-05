// 지원되는 언어 타입 정의
export type SupportedLocale = "ko" | "en";

// 언어 리소스 타입 정의
export interface Translations {
  // 공통 UI
  appName: string;
  home: string;
  memoList: string;
  settings: string;

  // 음성 인식
  startRecognition: string;
  stopRecognition: string;
  languageSelector: string;

  // 상태 메시지
  waiting: string;
  recording: string;
  connectionError: string;
  recognitionEnded: string;

  // 텍스트 변환 결과
  transcriptTitle: string;
  emptyTranscriptMessage: string;
  autoSaveMessage: string;
  copy: string;
  copied: string;
  copySuccess: string;
  copyError: string;

  // 사용 방법
  howToUse: string;
  selectLanguage: string;
  clickMicButton: string;
  speakNow: string;
  clickStopButton: string;
  usingExternalService: string;

  // 언어 이름
  korean: string;
  english: string;

  // 홈페이지
  homeTitle: string;
  homeDescription: string;
  generalError: string;
  backToHome: string;

  // 푸터
  contactUs: string;
  contactQuestion: string;
  copyright: string;
  serviceDescription: string;
}

// 한국어 리소스
export const koTranslations: Translations = {
  // 공통 UI
  appName: "Easylog",
  home: "홈",
  memoList: "메모 목록",
  settings: "설정",

  // 음성 인식
  startRecognition: "음성 인식 시작",
  stopRecognition: "인식 중지",
  languageSelector: "언어:",

  // 상태 메시지
  waiting: "대기 중...",
  recording: "음성 인식 중...",
  connectionError: "연결 오류",
  recognitionEnded: "인식 종료됨",

  // 텍스트 변환 결과
  transcriptTitle: "텍스트 변환 결과",
  emptyTranscriptMessage: "음성을 인식하면 텍스트가 여기에 표시됩니다",
  autoSaveMessage: "최종 텍스트는 자동으로 저장됩니다",
  copy: "복사",
  copied: "복사됨!",
  copySuccess: "텍스트가 클립보드에 복사되었습니다",
  copyError: "텍스트 복사 실패",

  // 사용 방법
  howToUse: "사용 방법",
  selectLanguage: "원하는 언어를 선택하세요",
  clickMicButton: "음성 인식 시작 버튼을 클릭하여 마이크 액세스를 허용하세요",
  speakNow: "말하면 텍스트가 실시간으로 표시됩니다",
  clickStopButton: "인식을 중지하려면 중지 버튼을 클릭하세요",
  usingExternalService:
    "외부 서버(easylog)를 통한 실시간 음성 인식을 사용합니다.",

  // 언어 이름
  korean: "한국어",
  english: "영어",

  // 홈페이지
  homeTitle: "음성으로 메모하기",
  homeDescription:
    "마이크 버튼을 클릭하고 말하면 텍스트로 변환됩니다. 언제든지 중지하고 저장할 수 있습니다.",
  generalError: "오류가 발생했습니다. 다시 시도해 주세요.",
  backToHome: "홈으로 돌아가기",

  // 푸터
  contactUs: "문의하기",
  contactQuestion: "서비스 이용에 궁금한 점이 있으신가요?",
  copyright: "음성 메모 비서. All rights reserved.",
  serviceDescription:
    "쉽고 편리한 음성 인식 기반 메모 서비스를 제공합니다. 언제 어디서나 음성으로 기록하세요.",
};

// 영어 리소스
export const enTranslations: Translations = {
  // 공통 UI
  appName: "Easylog",
  home: "Home",
  memoList: "Memo List",
  settings: "Settings",

  // 음성 인식
  startRecognition: "Start Recognition",
  stopRecognition: "Stop",
  languageSelector: "Language:",

  // 상태 메시지
  waiting: "Waiting...",
  recording: "Listening...",
  connectionError: "Connection Error",
  recognitionEnded: "Recognition Ended",

  // 텍스트 변환 결과
  transcriptTitle: "Speech to Text Result",
  emptyTranscriptMessage: "Speech will be displayed here when recognized",
  autoSaveMessage: "Text is automatically saved",
  copy: "Copy",
  copied: "Copied!",
  copySuccess: "Text copied to clipboard",
  copyError: "Copy failed",

  // 사용 방법
  howToUse: "How to Use",
  selectLanguage: "Select your language",
  clickMicButton: "Click the start button and allow microphone access",
  speakNow: "Speak, and text will appear in real-time",
  clickStopButton: "Click stop button to end recognition",
  usingExternalService:
    "Using real-time speech recognition through external server (easylog).",

  // 언어 이름
  korean: "Korean",
  english: "English",

  // 홈페이지
  homeTitle: "Voice Memo",
  homeDescription:
    "Click the microphone button and speak to convert to text. You can stop and save at any time.",
  generalError: "An error occurred. Please try again.",
  backToHome: "Back to Home",

  // 푸터
  contactUs: "Contact Us",
  contactQuestion: "Do you have any questions about using the service?",
  copyright: "Voice Memo Assistant. All rights reserved.",
  serviceDescription:
    "We provide an easy and convenient voice recognition-based memo service. Record with your voice anytime, anywhere.",
};

// 언어 코드에 따른 리소스 매핑
export const translationsByLocale: Record<SupportedLocale, Translations> = {
  ko: koTranslations,
  en: enTranslations,
};

// 음성 인식 언어 코드와 UI 언어 코드 매핑
export const recognitionLangToLocale: Record<string, SupportedLocale> = {
  "ko-KR": "ko",
  "en-US": "en",
};

export const localeToRecognitionLang: Record<SupportedLocale, string> = {
  ko: "ko-KR",
  en: "en-US",
};
