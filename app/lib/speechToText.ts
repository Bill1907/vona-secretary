import { audioBufferToBlob } from "./audioUtils";

// 브라우저 환경에서는 서버 API를 통해 음성 인식 기능 사용
// (SpeechClient는 서버 측에서만 사용 가능)

// 음성을 텍스트로 변환하는 함수 (서버 API 호출)
export async function transcribeAudio(
  audioBlob: Blob
): Promise<{ text: string; isFinal: boolean }> {
  try {
    // FormData 객체 생성하여 API로 전송
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    // API 호출
    const response = await fetch("/api/speech-to-text", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Transcription failed");
    }

    const result = (await response.json()) as {
      text: string;
      isFinal: boolean;
    };
    return result;
  } catch (error) {
    console.error("음성 인식 오류:", error);
    return { text: "", isFinal: false };
  }
}

// 스트리밍 음성 인식 함수
export async function streamingTranscribe(
  audioBlob: Blob
): Promise<ReadableStreamDefaultReader> {
  const formData = new FormData();
  formData.append("audio", audioBlob);

  const response = await fetch("/api/speech-to-text", {
    method: "POST",
    body: formData,
  });

  if (!response.body) {
    throw new Error("No response body");
  }

  return response.body.getReader();
}

// 스트리밍 응답 처리 함수
export async function processTranscriptionStream(
  reader: ReadableStreamDefaultReader,
  onTranscript: (text: string, isFinal: boolean) => void
): Promise<void> {
  const decoder = new TextDecoder();

  try {
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
    console.error("Error processing stream:", error);
  }
}
