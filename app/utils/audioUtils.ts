/**
 * 오디오 유틸리티 함수
 */

/**
 * Float32Array를 Int16Array로 변환 (Google Speech API 요구사항)
 */
export function convertFloat32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array;
}

/**
 * 오디오 컨텍스트 생성
 */
export function createAudioContext(sampleRate: number = 16000): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate,
  });
}

/**
 * 미디어 스트림 요청
 */
export async function requestMicrophoneAccess(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
  } catch (error) {
    console.error("마이크 액세스 오류:", error);
    throw error;
  }
}

/**
 * 리소스 정리
 */
export function cleanupAudioResources(
  mediaStream: MediaStream | null,
  processor: ScriptProcessorNode | null,
  audioContext: AudioContext | null
): void {
  // 미디어 스트림 정리
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }

  // 오디오 처리 정리
  if (processor && audioContext) {
    processor.disconnect();
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().catch(console.error);
  }
}
