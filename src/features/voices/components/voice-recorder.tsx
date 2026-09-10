import { useState } from "react";
import {
  Mic,
  Square,
  RotateCcw,
  X,
  FileAudio,
  Play,
  Pause,
} from "lucide-react";

import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useAudioRecorder } from "@/features/voices/hooks/use-audio-recorder";
import { RecordingScriptPanel } from "./recording-script-panel";

const MAX_TRAINING_SAMPLES = 5;

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VoiceRecorder({
  files,
  onFilesChange,
  isInvalid,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  isInvalid?: boolean;
}) {
  const lastFile = files[files.length - 1] ?? null;
  const { isPlaying, togglePlay } = useAudioPlayback(lastFile);
  const canAddMore = files.length < MAX_TRAINING_SAMPLES;
  const [scriptIndex, setScriptIndex] = useState(0);

  const {
    isRecording,
    elapsedTime,
    audioBlob,
    containerRef,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleStop = () => {
    stopRecording((blob) => {
      const recordedFile = new File(
        [blob],
        `recording-${files.length + 1}.wav`,
        {
          type: "audio/wav",
        },
      );
      onFilesChange([...files, recordedFile].slice(0, MAX_TRAINING_SAMPLES));
      setScriptIndex((index) => index + 1);
    });
  };

  const handleReRecord = () => {
    onFilesChange([]);
    setScriptIndex(0);
    resetRecording();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/50 bg-destructive/5 px-6 py-10">
        <p className="text-center text-sm text-destructive">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetRecording}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (files.length > 0 && !isRecording) {
    return (
      <div className="flex flex-col gap-3">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${index}`}
            className="flex items-center gap-3 rounded-xl border p-4"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <FileAudio className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
                {index === files.length - 1 && audioBlob && elapsedTime > 0 && (
                  <>&nbsp;&middot;&nbsp;{formatTime(elapsedTime)}</>
                )}
              </p>
            </div>

            {index === files.length - 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={togglePlay}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                onFilesChange(files.filter((_, i) => i !== index))
              }
              title="Remove"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        {canAddMore && (
          <RecordingScriptPanel
            index={scriptIndex}
            onIndexChange={setScriptIndex}
          />
        )}
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={startRecording}
          >
            <Mic className="size-3.5" />
            Record another ({files.length}/{MAX_TRAINING_SAMPLES})
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={handleReRecord}
        >
          <RotateCcw className="size-3.5" />
          Clear recordings
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex flex-col gap-3">
       <RecordingScriptPanel
         index={scriptIndex}
         onIndexChange={setScriptIndex}
       />
       <div className="flex flex-col overflow-hidden rounded-2xl border">
         <div ref={containerRef} className="w-full" />
         <div className="flex items-center justify-between border-t p-4">
            <p className="text-[28px] font-semibold leading-[1.2] tracking-tight">
              {formatTime(elapsedTime)}
            </p>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleStop}
            >
              <Square className="size-3" />
              Stop
            </Button>
         </div>
       </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
     <RecordingScriptPanel index={scriptIndex} onIndexChange={setScriptIndex} />
     <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10",
        isInvalid && "border-destructive",
      )}
     >
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Mic className="size-5 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold tracking-tight">
          Record your voice
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Record up to {MAX_TRAINING_SAMPLES} clips for training
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={startRecording}
      >
        <Mic className="size-3.5" />
        Record
      </Button>
     </div>
    </div>
  );
}
