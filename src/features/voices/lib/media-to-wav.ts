const TARGET_SAMPLE_RATE = 44100;

export async function mediaFilesToWav(files: File[]): Promise<File> {
  if (files.length === 0) {
    throw new Error("At least one audio or video file is required");
  }

  const decoded: AudioBuffer[] = [];
  for (const file of files) {
    decoded.push(await decodeMediaFile(file));
  }

  const totalDuration = decoded.reduce((sum, buffer) => sum + buffer.duration, 0);
  const length = Math.max(1, Math.ceil(totalDuration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE);

  let offset = 0;
  for (const buffer of decoded) {
    const source = offline.createBufferSource();
    source.buffer = buffer;
    source.connect(offline.destination);
    source.start(offset);
    offset += buffer.duration;
  }

  const rendered = await offline.startRendering();
  const wav = audioBufferToWav(rendered);
  return new File([wav], "training.wav", { type: "audio/wav" });
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
