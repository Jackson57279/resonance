import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  RECORDING_SCRIPTS,
  getRecordingScript,
} from "@/features/voices/data/recording-scripts";

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

      <p className="text-xs text-muted-foreground">{script.hint}</p>
    </div>
  );
}
