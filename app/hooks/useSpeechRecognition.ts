import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  cleanupAudioResources,
  convertFloat32ToInt16,
  createAudioContext,
  requestMicrophoneAccess,
} from "../utils/audioUtils";

// 외부 WS 서버 주소
const WS_SERVER_URL = "https://easylog-server-307101842878.us-central1.run.app";

// 인식 결과 타입
interface RecognitionResult {
  final: string;
  interim: string;
}

// 언어 타입
export type SupportedLanguage = "ko-KR" | "en-US" | "ja-JP" | "zh-CN";

interface UseSpeechRecognitionReturn {
  isRecording: boolean;
  status: string;
  transcript: RecognitionResult;
  startRecognition: () => Promise<void>;
  stopRecognition: () => void;
}

export default function useSpeechRecognition(
  language: SupportedLanguage = "ko-KR"
): UseSpeechRecognitionReturn {
  // 상태
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("대기 중...");
  const [transcript, setTranscript] = useState<RecognitionResult>({
    final: "",
    interim: "",
  });

  // 레퍼런스
  const socketRef = useRef<Socket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const currentTranscriptRef = useRef<string>("");
  const audioCounterRef = useRef<number>(0);
  const languageRef = useRef<SupportedLanguage>(language);

  // 언어 업데이트 시 ref 업데이트
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // 텍스트 화면 업데이트
  const updateTranscriptDisplay = useCallback((interimText: string = "") => {
    console.log(
      "화면 업데이트 - 최종:",
      currentTranscriptRef.current,
      "임시:",
      interimText
    );

    setTranscript({
      final: currentTranscriptRef.current,
      interim: interimText,
    });
  }, []);

  // 소켓 이벤트 리스너 설정
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current) return;

    // 연결 성공
    socketRef.current.on("connect", () => {
      console.log("소켓 연결됨! ID:", socketRef.current?.id);
      setStatus("소켓 연결됨! ID: " + socketRef.current?.id);

      // 음성 인식 시작 요청
      socketRef.current?.emit("startRecognition", {
        language: languageRef.current,
      });
    });

    // 연결 오류
    socketRef.current.on("connect_error", (error) => {
      console.error("소켓 연결 오류:", error);
      setStatus("소켓 연결 오류: " + error.message);
    });

    // 인식 시작됨
    socketRef.current.on("recognitionStarted", () => {
      console.log("인식 시작 이벤트 수신");
      setStatus("음성 인식 중...");
    });

    // 인식 결과 수신
    socketRef.current.on("recognitionResult", (data) => {
      console.log(
        "%c인식 결과 수신!",
        "background: #3f51b5; color: white; padding: 4px; border-radius: 3px;"
      );
      console.log("데이터:", data);

      // 데이터 유효성 검사
      if (!data || typeof data.transcript !== "string") {
        console.error("잘못된 형식의 인식 결과 데이터:", data);
        return;
      }

      if (data.isFinal) {
        // 최종 결과는 누적
        currentTranscriptRef.current += data.transcript + " ";
        updateTranscriptDisplay();
        console.log(
          "%c최종 결과 누적:",
          "color: green; font-weight: bold;",
          currentTranscriptRef.current
        );
      } else {
        // 임시 결과는 표시만
        updateTranscriptDisplay(data.transcript);
        console.log(
          "%c임시 결과 표시:",
          "color: blue; font-style: italic;",
          data.transcript
        );
      }
    });

    // 인식 종료
    socketRef.current.on("recognitionEnd", () => {
      console.log("인식 종료 이벤트 수신");
      setStatus("인식 종료됨");
      setIsRecording(false);
    });

    // 오류 발생
    socketRef.current.on("error", (error) => {
      console.error("서버 오류 이벤트 수신:", error);
      setStatus(`오류: ${error.message}`);
    });

    // 연결 종료
    socketRef.current.on("disconnect", (reason) => {
      console.log("연결 종료 이벤트 수신, 이유:", reason);
      cleanupResources();
      setStatus("연결 끊김: " + reason);
      setIsRecording(false);
    });
  }, [updateTranscriptDisplay]);

  // 오디오 처리 설정
  const setupAudioProcessing = useCallback(() => {
    try {
      // 오디오 컨텍스트 생성
      audioContextRef.current = createAudioContext();

      if (!audioContextRef.current || !mediaStreamRef.current) return;

      // 오디오 소스 생성
      const source = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current
      );

      // 오디오 프로세서 설정
      processorRef.current = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );

      // 오디오 데이터 처리 및 전송
      processorRef.current.onaudioprocess = (e) => {
        if (socketRef.current && socketRef.current.connected) {
          const inputData = e.inputBuffer.getChannelData(0);

          // 오디오 데이터 로깅 (처음 몇 번만)
          if (audioCounterRef.current < 5) {
            console.log(
              `오디오 데이터 #${audioCounterRef.current} 샘플:`,
              Array.from(inputData.slice(0, 10)), // 처음 10개 샘플만 로깅
              `(총 ${inputData.length} 샘플)`
            );
            audioCounterRef.current++;
          } else if (audioCounterRef.current === 5) {
            console.log("이후 오디오 데이터 로깅은 생략됩니다.");
            audioCounterRef.current++;
          }

          const audioData = convertFloat32ToInt16(inputData);

          // 변환된 데이터 크기 로깅
          if (audioCounterRef.current <= 6) {
            console.log(
              `변환된 Int16 오디오 데이터 크기: ${audioData.length * 2} 바이트`
            );
          }

          // 데이터 전송 - 샘플 코드와 동일한 형식으로 전송
          socketRef.current.emit("audioData", {
            audio: audioData.buffer,
            language: languageRef.current,
          });

          // 전송 로깅
          if (audioCounterRef.current <= 6) {
            console.log("오디오 데이터 전송 완료");
          }
        }
      };

      // 연결
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      console.log("오디오 처리 설정 완료");
    } catch (error) {
      console.error("오디오 처리 설정 오류:", error);
      throw error;
    }
  }, []);

  // 리소스 정리
  const cleanupResources = useCallback(() => {
    // 오디오 리소스 정리
    cleanupAudioResources(
      mediaStreamRef.current,
      processorRef.current,
      audioContextRef.current
    );

    mediaStreamRef.current = null;
    processorRef.current = null;
    audioContextRef.current = null;

    // 소켓 연결 정리
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // 음성 인식 시작
  const startRecognition = useCallback(async () => {
    try {
      // 이미 녹음 중이면 중단
      if (isRecording) return;

      // 상태 업데이트
      setStatus("소켓 연결 시도 중...");
      setIsRecording(true);

      // 기존 리소스 정리
      cleanupResources();

      // 소켓 연결
      console.log("소켓 연결 시도 중...");
      socketRef.current = io(`${WS_SERVER_URL}/speech`, {
        transports: ["websocket"],
        upgrade: false,
        withCredentials: false,
      });

      console.log("소켓 객체 생성됨:", socketRef.current?.id);

      // 소켓 이벤트 핸들러 설정
      setupSocketListeners();

      // 마이크 접근 요청
      setStatus("마이크 액세스 요청 중...");
      mediaStreamRef.current = await requestMicrophoneAccess();

      // 오디오 처리 설정
      setupAudioProcessing();

      // 음성 인식 시작 요청은 소켓 연결 성공 이벤트에서 처리

      // UI 상태 업데이트
      setStatus("음성 인식 중...");
      currentTranscriptRef.current = "";
      setTranscript({ final: "", interim: "" });
      audioCounterRef.current = 0;
    } catch (error) {
      console.error("음성 인식 시작 오류:", error);
      setStatus(
        `오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
      setIsRecording(false);
    }
  }, [
    isRecording,
    cleanupResources,
    setupSocketListeners,
    setupAudioProcessing,
  ]);

  // 음성 인식 중지
  const stopRecognition = useCallback(() => {
    // 녹음 중이 아니면 무시
    if (!isRecording) return;

    // 소켓이 연결되어 있으면 중지 요청
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("stopRecognition");
    }

    // 리소스 정리
    cleanupResources();

    // UI 업데이트
    setIsRecording(false);
    setStatus("중지됨");
  }, [isRecording, cleanupResources]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  return {
    isRecording,
    status,
    transcript,
    startRecognition,
    stopRecognition,
  };
}
