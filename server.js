import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import * as build from "./build/index.js";
import { getSocketIO } from "./app/server/socket.server";

// 환경 변수 설정
const MODE = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;

// Express 앱 생성
const app = express();

// 정적 파일 서빙
app.use(express.static("public"));

// Remix 핸들러 설정
app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({ build })
    : (...args) => {
        purgeRequireCache();
        const requestHandler = createRequestHandler({
          build: require("./build/index.js"),
          mode: MODE,
        });
        return requestHandler(...args);
      }
);

// HTTP 서버 생성
const httpServer = createServer(app);

// Socket.IO 서버 초기화
getSocketIO(httpServer);

// 서버 시작
httpServer.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

// 개발 모드에서의 캐시 퍼지 함수
function purgeRequireCache() {
  // 개발 중인 Remix 앱 소스의 캐시 정리
  for (const key in require.cache) {
    if (key.startsWith(process.cwd() + "/build/")) {
      delete require.cache[key];
    }
  }
}
