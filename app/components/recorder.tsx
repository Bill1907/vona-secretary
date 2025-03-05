"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { createWavRecorder } from "../lib/audioUtils";
import { WavRecorder } from "wavtools";
import {
  streamingTranscribe,
  processTranscriptionStream,
} from "../lib/speechToText";

interface RecorderProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
}

const CHUNK_DURATION = 3000; // 3초마다 처리
const RECORDING_INTERVAL = 1000; // 1초마다 데이터 수집

export default function AudioRecorder({
  onTranscript = () => {},
}: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Int16Array | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const recorderRef = useRef<WavRecorder | null>(null);
  const activeStreamRef = useRef<ReadableStreamDefaultReader | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Int16Array[]>([]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 recorder 인스턴스 생성
    recorderRef.current = createWavRecorder();

    // 컴포넌트가 언마운트될 때 정리
    return () => {
      if (recorderRef.current) {
        recorderRef.current.end().catch(console.error);
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      if (activeStreamRef.current) {
        activeStreamRef.current.cancel().catch(console.error);
      }
    };
  }, []);

  const processAudioData = async (audioBlob: Blob) => {
    // 이전 스트림이 있다면 중단
    if (activeStreamRef.current) {
      try {
        await activeStreamRef.current.cancel();
        activeStreamRef.current = null;
      } catch (e) {
        console.error("Error canceling previous stream:", e);
      }
    }

    try {
      // 스트리밍 음성 인식 시작
      const reader = await streamingTranscribe(audioBlob);
      activeStreamRef.current = reader;

      // 스트리밍 응답 처리
      await processTranscriptionStream(reader, (text, isFinal) => {
        setTranscript((prev) => (isFinal ? `${prev} ${text}` : text));
        onTranscript(text, isFinal);
      });
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      activeStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const recorder = recorderRef.current;
      if (!recorder) return;

      chunksRef.current = [];
      setTranscript("");

      await recorder.begin();

      recorder.record((data: { mono: Int16Array }) => {
        // 데이터 수신 콜백
        chunksRef.current.push(data.mono);
      });

      // 일정 간격으로 수집된 오디오 데이터를 처리
      recordingIntervalRef.current = setInterval(async () => {
        if (chunksRef.current.length === 0) return;

        // 모든 청크를 하나의 배열로 합치기
        const totalLength = chunksRef.current.reduce(
          (acc, chunk) => acc + chunk.length,
          0
        );
        const mergedData = new Int16Array(totalLength);

        let offset = 0;
        for (const chunk of chunksRef.current) {
          mergedData.set(chunk, offset);
          offset += chunk.length;
        }

        // 오디오 데이터를 Blob으로 변환
        const audioBlob = await createAudioBlob(mergedData);

        // 음성 인식 처리
        processAudioData(audioBlob);

        // 처리 후 청크 초기화 (선택적)
        // chunksRef.current = [];
      }, CHUNK_DURATION);

      setIsRecording(true);
    } catch (error) {
      console.error("녹음 시작 오류:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      const recorder = recorderRef.current;
      if (!recorder) return;

      const data = await recorder.end();
      setAudioData(data.mono);
      setIsRecording(false);

      // 마지막 청크 처리
      if (chunksRef.current.length > 0) {
        const totalLength = chunksRef.current.reduce(
          (acc, chunk) => acc + chunk.length,
          0
        );
        const mergedData = new Int16Array(totalLength);

        let offset = 0;
        for (const chunk of chunksRef.current) {
          mergedData.set(chunk, offset);
          offset += chunk.length;
        }

        const audioBlob = await createAudioBlob(mergedData);
        processAudioData(audioBlob);
      }
    } catch (error) {
      console.error("녹음 중지 오류:", error);
    }
  };

  const playRecording = async () => {
    if (!audioData) return;

    try {
      const { WavStreamPlayer } = await import("wavtools");
      const player = new WavStreamPlayer({ sampleRate: 24000 });
      await player.connect();
      player.add16BitPCM(audioData, "recording");
    } catch (error) {
      console.error("오디오 재생 오류:", error);
    }
  };

  // Int16Array를 WAV Blob으로 변환
  const createAudioBlob = async (audioData: Int16Array): Promise<Blob> => {
    const sampleRate = 24000;
    const numChannels = 1;

    // WAV 헤더 생성
    const buffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(buffer);

    // "RIFF" 청크 디스크립터
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + audioData.length * 2, true);
    writeString(view, 8, "WAVE");

    // "fmt " 서브청크
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // 서브청크 크기
    view.setUint16(20, 1, true); // 오디오 포맷 (1 = PCM)
    view.setUint16(22, numChannels, true); // 채널 수
    view.setUint32(24, sampleRate, true); // 샘플레이트
    view.setUint32(28, sampleRate * numChannels * 2, true); // 바이트레이트
    view.setUint16(32, numChannels * 2, true); // 블록 얼라인
    view.setUint16(34, 16, true); // 비트 퍼 샘플

    // "data" 서브청크
    writeString(view, 36, "data");
    view.setUint32(40, audioData.length * 2, true);

    // 오디오 데이터 쓰기
    const audioDataView = new Int16Array(buffer, 44, audioData.length);
    audioDataView.set(audioData);

    return new Blob([buffer], { type: "audio/wav" });
  };

  // 헬퍼 함수: DataView에 문자열 쓰기
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold">오디오 녹음기</h2>

      <div className="flex gap-2">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
        >
          {isRecording ? "녹음 중지" : "녹음 시작"}
        </Button>

        <Button onClick={playRecording} disabled={!audioData} variant="outline">
          녹음 재생
        </Button>
      </div>

      {transcript && (
        <div className="mt-4 p-4 border rounded bg-gray-50 max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">음성 인식 결과:</h3>
          <p>{transcript}</p>
        </div>
      )}

      {audioData && !transcript && (
        <div className="mt-4 p-2 border rounded">
          <p>녹음 완료! 재생 버튼을 클릭하여 들어보세요.</p>
        </div>
      )}
    </div>
  );
}
