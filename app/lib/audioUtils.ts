import { WavRecorder, WavStreamPlayer } from "wavtools";

// 기본 샘플레이트 설정
const DEFAULT_SAMPLE_RATE = 24000;

// WavRecorder 인스턴스 생성 함수
export function createWavRecorder(
  options = { sampleRate: DEFAULT_SAMPLE_RATE }
) {
  return new WavRecorder(options);
}

// WavStreamPlayer 인스턴스 생성 함수
export function createWavStreamPlayer(
  options = { sampleRate: DEFAULT_SAMPLE_RATE }
) {
  return new WavStreamPlayer(options);
}

// 녹음된 오디오 데이터를 Blob으로 변환
export async function audioBufferToBlob(
  audioBuffer: Int16Array,
  sampleRate = DEFAULT_SAMPLE_RATE
): Promise<Blob> {
  const numChannels = 1;

  // WAV 헤더 생성
  const buffer = new ArrayBuffer(44 + audioBuffer.length * 2);
  const view = new DataView(buffer);

  // "RIFF" 청크 디스크립터
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + audioBuffer.length * 2, true);
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
  view.setUint32(40, audioBuffer.length * 2, true);

  // 오디오 데이터 쓰기
  const audioDataView = new Int16Array(buffer, 44, audioBuffer.length);
  audioDataView.set(audioBuffer);

  return new Blob([buffer], { type: "audio/wav" });
}

// 헬퍼 함수: DataView에 문자열 쓰기
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// 오디오 재생 함수
export async function playAudio(
  audioData: Int16Array,
  trackId = "default-track"
) {
  const player = createWavStreamPlayer();
  await player.connect();
  player.add16BitPCM(audioData, trackId);

  return {
    getFrequencies: () => player.getFrequencies(),
    interrupt: async () => player.interrupt(),
  };
}

export async function convertWebMToLinear16(
  webmData: Blob
): Promise<ArrayBuffer> {
  // WebM을 LINEAR16으로 변환하는 로직
  // 이 부분은 별도의 오디오 변환 라이브러리가 필요할 수 있습니다
  // 예: ffmpeg.wasm 등을 사용
  throw new Error("Not implemented");
}

export async function createSpeechClient() {
  // Google Cloud Speech-to-Text 클라이언트 생성
  // 브라우저에서 직접 사용하기 위한 설정 필요
  throw new Error("Not implemented");
}
