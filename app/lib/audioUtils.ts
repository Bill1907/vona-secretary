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
