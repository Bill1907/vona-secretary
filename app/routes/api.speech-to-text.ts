import type { ActionFunction } from "@remix-run/cloudflare";
import { speechClient } from "~/lib/speechToText";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const audioBlob = formData.get("audio") as Blob;

  if (!audioBlob) {
    return Response.json({ error: "No audio data received" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 스트리밍 인식 스트림 생성
        const recognizeStream = speechClient.streamingRecognize();

        // 응답 처리를 위한 이벤트 리스너
        recognizeStream.on("data", (response: any) => {
          const result = response.results[0];
          if (result?.alternatives?.[0]) {
            controller.enqueue(
              JSON.stringify({
                transcript: result.alternatives[0].transcript,
                isFinal: result.isFinal,
                stability: result.stability, // 안정성 값 추가
              }) + "\n"
            );
          }
        });

        recognizeStream.on("end", () => controller.close());
        recognizeStream.on("error", (error: any) => {
          console.error("Recognition error:", error);
          controller.error(error);
        });

        // 첫 번째 요청은 반드시 설정만 포함해야 함
        const configRequest = {
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: "ko-KR",
            enableAutomaticPunctuation: true,
          },
          interimResults: true,
          singleUtterance: false, // 연속 음성 인식을 위해 false
        };

        console.log("Sending config request...");
        recognizeStream.write({ streamingConfig: configRequest });

        // 오디오 데이터 준비 및 전송
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContent = new Uint8Array(arrayBuffer);
        console.log("Audio data size:", audioContent.length, "bytes");

        // 오디오 데이터는 별도의 요청으로 전송
        console.log("Sending audio data...");
        recognizeStream.write({
          audioContent: audioContent,
        });

        // 스트림 종료
        console.log("Finishing stream...");
        recognizeStream.end();
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
