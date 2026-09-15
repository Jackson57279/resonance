"use client";

import { ChevronLeft, ChevronRight, Copy, Quote } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  RECORDING_SCRIPTS,
  formatAllRecordingScripts,
  getRecordingScript,
} from "@/features/voices/data/recording-scripts";

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy. Select the text and copy it yourself.");
  }
}

export function RecordingScriptPanel({
  index,
  onIndexChange,
  className,
}: {
  index: number;
  onIndexChange: (index: number) => void;
  className?: string;
}) {
  const script = getRecordingScript(index);
  const position =
    ((index % RECORDING_SCRIPTS.length) + RECORDING_SCRIPTS.length) %
    RECORDING_SCRIPTS.length;

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border p-4", className)}>
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Quote className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{script.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            Script {position + 1} of {RECORDING_SCRIPTS.length}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            void copyText("Script", `${script.title}\n${script.text}`)
          }
          title="Copy this script"
        >
          <Copy className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onIndexChange(index - 1)}
          title="Previous script"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onIndexChange(index + 1)}
          title="Next script"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <p className="text-sm leading-relaxed">{script.text}</p>

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">{script.hint}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => void copyText("All 10 scripts", formatAllRecordingScripts())}
        >
          Copy all 10
        </Button>
      </div>
    </div>
  );
}
