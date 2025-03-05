import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: Server | undefined;

export function getSocketIO(httpServer?: HTTPServer): Server {
  if (!io && httpServer) {
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Socket.IO 이벤트 핸들러 설정
    io.of("/speech").on("connection", (socket) => {
      console.log(`Speech client connected: ${socket.id}`);

      // 음성 인식 시작 요청 처리
      socket.on("startRecognition", (data) => {
        console.log(
          `Starting recognition for ${socket.id}, language: ${data.language}`
        );
        socket.emit("recognitionStarted");
      });

      // 오디오 데이터 수신 처리
      socket.on("audioData", async (data) => {
        try {
          // 실제 구현에서는 여기서 음성 인식 API로 데이터를 전송하고 결과를 받아야 합니다
          // 데모를 위해 임의의 응답을 전송

          // 랜덤하게 결과를 생성 (60% 확률로 임시 결과, 40% 확률로 최종 결과)
          const isFinal = Math.random() > 0.6;
          const languages = {
            "ko-KR": [
              "안녕하세요",
              "반갑습니다",
              "음성 인식 테스트입니다",
              "오늘 날씨가 좋네요",
            ],
            "en-US": [
              "Hello",
              "Nice to meet you",
              "This is a speech recognition test",
              "The weather is nice today",
            ],
            "ja-JP": [
              "こんにちは",
              "はじめまして",
              "音声認識テストです",
              "今日の天気はいいですね",
            ],
            "zh-CN": [
              "你好",
              "很高兴见到你",
              "这是语音识别测试",
              "今天天气真好",
            ],
          };

          const language = data.language || "ko-KR";
          const phrases =
            languages[language as keyof typeof languages] || languages["ko-KR"];
          const transcript =
            phrases[Math.floor(Math.random() * phrases.length)];

          socket.emit("recognitionResult", {
            transcript,
            isFinal,
          });
        } catch (error) {
          console.error("Error processing audio data:", error);
          socket.emit("error", { message: "Audio processing error" });
        }
      });

      // 음성 인식 중지 요청 처리
      socket.on("stopRecognition", () => {
        console.log(`Stopping recognition for ${socket.id}`);
        socket.emit("recognitionEnd");
      });

      // 연결 종료 처리
      socket.on("disconnect", (reason) => {
        console.log(
          `Speech client disconnected: ${socket.id}, reason: ${reason}`
        );
      });
    });
  }

  return io!;
}

export function getIO(): Server | undefined {
  return io;
}
