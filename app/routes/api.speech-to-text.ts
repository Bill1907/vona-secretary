import type { ActionFunction } from "@remix-run/cloudflare";

// 브라우저 환경에서는 Google Cloud Speech API를 직접 사용할 수 없으므로,
// 여기서는 클라우드 함수나 서버리스 백엔드를 사용해야 합니다.
// Remix를 Cloudflare Pages에서 실행하는 경우, Cloudflare Workers에서 처리해야 합니다.

export const action: ActionFunction = async ({ request }) => {
  // 요청 헤더에서 언어 정보 확인
  const formData = await request.formData();
  const audioBlob = formData.get("audio") as Blob;
  const language = (formData.get("language") as string) || "ko-KR";

  if (!audioBlob) {
    return Response.json({ error: "No audio data received" }, { status: 400 });
  }

  console.log(
    `Received audio data: ${audioBlob.size} bytes, language: ${language}`
  );

  // 실제 구현에서는 아래 주석 처리된 코드를 사용하여
  // 오디오 데이터를 백엔드 서비스로 전송하고 결과를 받아야 합니다.
  /*
  const audioBuffer = await audioBlob.arrayBuffer();
  const response = await fetch("https://your-backend-service.com/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Language": language,
    },
    body: audioBuffer,
  });
  
  if (!response.ok) {
    return Response.json({ error: "Transcription service error" }, { status: 500 });
  }
  
  return response;
  */

  // 테스트 목적으로 가상의 스트리밍 응답 생성
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 언어별 샘플 텍스트 준비
        const languageSamples: Record<string, string> = {
          "ko-KR": "안녕하세요, 음성 인식 테스트입니다.",
          "en-US": "Hello, this is a speech recognition test.",
          "ja-JP": "こんにちは、音声認識テストです。",
          "zh-CN": "你好，这是语音识别测试。",
        };

        // 선택된 언어의 텍스트 가져오기
        const finalText = languageSamples[language] || languageSamples["ko-KR"];

        // 데모용 지연 시간 (실제 음성 인식 처리 시간을 시뮬레이션)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 첫 번째 임시 결과
        controller.enqueue(
          JSON.stringify({
            transcript: "음성 인식 처리 중...",
            isFinal: false,
          }) + "\n"
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 두 번째 임시 결과 (언어별 다른 텍스트)
        controller.enqueue(
          JSON.stringify({
            transcript:
              finalText.substring(0, Math.floor(finalText.length / 2)) + "...",
            isFinal: false,
          }) + "\n"
        );

        await new Promise((resolve) => setTimeout(resolve, 800));

        // 최종 결과
        controller.enqueue(
          JSON.stringify({
            transcript: finalText,
            isFinal: true,
          }) + "\n"
        );

        // 스트림 종료
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
