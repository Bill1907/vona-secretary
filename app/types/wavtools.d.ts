declare module "wavtools" {
  interface WavRecorderOptions {
    sampleRate?: number;
  }

  interface RecordingData {
    mono: Int16Array;
    left?: Int16Array;
    right?: Int16Array;
  }

  export class WavRecorder {
    constructor(options?: WavRecorderOptions);
    begin(): Promise<void>;
    record(callback: (data: RecordingData) => void): Promise<void>;
    end(): Promise<RecordingData>;
  }

  interface WavStreamPlayerOptions {
    sampleRate?: number;
  }

  export class WavStreamPlayer {
    constructor(options?: WavStreamPlayerOptions);
    connect(): Promise<void>;
    add16BitPCM(data: Int16Array, trackId: string): void;
    getFrequencies(): Uint8Array;
    interrupt(): Promise<void>;
  }
}
