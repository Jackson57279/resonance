import {
  CONDITIONING_GAP_SECONDS,
  CONDITIONING_SLICE_SECONDS,
  MAX_REFERENCE_SECONDS,
  TARGET_SAMPLE_RATE,
} from "@/features/voices/data/training";

export async function mediaFilesToWav(files: File[]): Promise<File> {
  if (files.length === 0) {
    throw new Error("At least one audio or video file is required");
  }

  const decoded: AudioBuffer[] = [];
  for (const file of files) {
    decoded.push(await decodeMediaFile(file));
  }

  const mono: AudioBuffer[] = [];
  for (const buffer of decoded) {
    mono.push(await resampleToMono(buffer));
  }

  const mixed = mixReference(mono);
  const wav = audioBufferToWav(mixed);
  return new File([wav], "training.wav", { type: "audio/wav" });
}

export function mixReference(buffers: AudioBuffer[]): AudioBuffer {
  const trimmed = buffers
    .map(trimSilence)
    .filter((buffer) => buffer.duration >= 0.25);

  if (trimmed.length === 0) {
    throw new Error(
      "Training clips are too quiet. Record again in a quiet room.",
    );
  }

  const sliceLen = Math.floor(TARGET_SAMPLE_RATE * CONDITIONING_SLICE_SECONDS);
  const gap = new Float32Array(
    Math.floor(TARGET_SAMPLE_RATE * CONDITIONING_GAP_SECONDS),
  );
  const maxLen = Math.floor(TARGET_SAMPLE_RATE * MAX_REFERENCE_SECONDS);

  const slices: Float32Array[] = [];
  const rest: Float32Array[] = [];

  for (const index of sliceOrder(trimmed.length)) {
    const channel = trimmed[index]!.getChannelData(0);
    slices.push(channel.slice(0, Math.min(sliceLen, channel.length)));
    if (channel.length > sliceLen) {
      rest.push(channel.slice(sliceLen));
    }
  }

  const parts: Float32Array[] = [];
  const pushCapped = (chunk: Float32Array) => {
    const used = parts.reduce((sum, part) => sum + part.length, 0);
    if (used >= maxLen) return;
    const remain = maxLen - used;
    parts.push(chunk.length > remain ? chunk.slice(0, remain) : chunk);
  };

  for (let i = 0; i < slices.length; i++) {
    if (i > 0) pushCapped(gap);
    pushCapped(slices[i]!);
  }
  for (const chunk of rest) {
    pushCapped(gap);
    pushCapped(chunk);
  }

  return concatChannels(parts, TARGET_SAMPLE_RATE);
}

export function sliceOrder(count: number): number[] {
  if (count <= 1) return [0];
  const order = [0, count - 1];
  for (let i = 1; i < count - 1; i++) {
    order.push(i);
  }
  return order;
}

async function decodeMediaFile(file: File): Promise<AudioBuffer> {
  const ctx = new AudioContext();
  try {
    const data = await file.arrayBuffer();
    return await ctx.decodeAudioData(data.slice(0));
  } catch {
    throw new Error(
      `Could not read audio from "${file.name}". Use a common audio or video format.`,
    );
  } finally {
    await ctx.close();
  }
}

async function resampleToMono(buffer: AudioBuffer): Promise<AudioBuffer> {
  const length = Math.max(1, Math.ceil(buffer.duration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);
  return offline.startRendering();
}

function rms(channel: Float32Array, start: number, end: number): number {
  let sum = 0;
  const n = Math.max(1, end - start);
  for (let i = start; i < end; i++) {
    const sample = channel[i] ?? 0;
    sum += sample * sample;
  }
  return Math.sqrt(sum / n);
}

function makeBuffer(channel: Float32Array, sampleRate: number): AudioBuffer {
  const length = Math.max(1, channel.length);
  const ctx = new OfflineAudioContext(1, length, sampleRate);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const dest = buffer.getChannelData(0);
  const count = Math.min(channel.length, dest.length);
  for (let i = 0; i < count; i++) {
    dest[i] = channel[i] ?? 0;
  }
  return buffer;
}

function trimSilence(buffer: AudioBuffer): AudioBuffer {
  const channel = buffer.getChannelData(0);
  const window = Math.max(1, Math.floor(buffer.sampleRate * 0.02));
  const threshold = 0.01;
  let start = 0;
  let end = channel.length;

  while (
    start + window < end &&
    rms(channel, start, start + window) < threshold
  ) {
    start += window;
  }
  while (
    end - window > start &&
    rms(channel, end - window, end) < threshold
  ) {
    end -= window;
  }

  return makeBuffer(channel.slice(start, end), buffer.sampleRate);
}

function concatChannels(
  parts: Float32Array[],
  sampleRate: number,
): AudioBuffer {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Float32Array(Math.max(1, total));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return makeBuffer(out, sampleRate);
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const channel = buffer.getChannelData(0);
  const samples = channel.length;
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = samples * bytesPerSample;
  const headerSize = 44;
  const view = new DataView(new ArrayBuffer(headerSize + dataSize));

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples; i++) {
    const sample = Math.max(-1, Math.min(1, channel[i] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}
