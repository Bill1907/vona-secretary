import { useState, useRef, useEffect } from "react";

interface RecorderProps {
  onTranscript: (text: string, isFinal: boolean) => void;
}

const CHUNK_DURATION = 60000; // 60초로 변경
const RECORDING_INTERVAL = 1000; // 1초마다 데이터 수집

export default function Recorder({ onTranscript }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const activeStreamRef = useRef<ReadableStreamDefaultReader | null>(null);

  const processAudioData = async (audioBlob: Blob) => {
    // 이전 스트림이 있다면 중단
    if (activeStreamRef.current) {
      try {
        await activeStreamRef.current.cancel();
      } catch (e) {
        console.error("Error canceling previous stream:", e);
      }
    }

    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      activeStreamRef.current = reader;

      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decodedValue = decoder.decode(value);
        const lines = decodedValue.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const { transcript, isFinal } = JSON.parse(line);
            onTranscript(transcript, isFinal);
          } catch (e) {
            console.error("Error parsing response:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      activeStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          console.log("Recorded audio chunk size:", event.data.size);
          processAudioData(event.data);
        }
      };

      mediaRecorder.start(RECORDING_INTERVAL);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      // 활성 스트림 정리
      if (activeStreamRef.current) {
        activeStreamRef.current.cancel();
        activeStreamRef.current = null;
      }

      setIsRecording(false);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`px-4 py-2 rounded ${
            isRecording ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          녹음 시작
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`px-4 py-2 rounded ${
            !isRecording ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
          } text-white`}
        >
          녹음 중지
        </button>
      </div>
      <div className="text-sm text-gray-600">
        {isRecording ? "녹음 중..." : "녹음 대기 중"}
      </div>
    </div>
  );
}
