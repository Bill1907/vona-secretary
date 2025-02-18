import { SpeechClient } from "@google-cloud/speech";

export const speechClient = new SpeechClient({
  keyFilename: "./vona-440102-e99b9b0709d6.json",
});
