"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  FolderOpen,
  X,
  FileAudio,
  FileVideo,
  Upload,
  Mic,
  Tag,
  Play,
  Pause,
  Check,
  ChevronsUpDown,
  Globe,
  Layers,
  AlignLeft,
} from "lucide-react";
import locales from "locale-codes";

import { cn, formatFileSize } from "@/lib/utils";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useTRPC } from "@/trpc/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  VOICE_CATEGORIES,
  VOICE_CATEGORY_LABELS,
} from "@/features/voices/data/voice-categories";
import { mediaFilesToWav } from "@/features/voices/lib/media-to-wav";
import { VoiceRecorder } from "./voice-recorder";

const MAX_TRAINING_SAMPLES = 5;
const MAX_SAMPLE_SIZE_BYTES = 50 * 1024 * 1024;

const LANGUAGE_OPTIONS = locales.all
  .filter((l) => l.tag && l.tag.includes("-") && l.name)
  .map((l) => ({
    value: l.tag,
    label: l.location ? `${l.name} (${l.location})` : l.name,
  }));

const voiceCreateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  files: z
    .array(z.instanceof(File))
    .min(1, "Upload at least 1 audio or video file")
    .max(MAX_TRAINING_SAMPLES, `You can upload up to ${MAX_TRAINING_SAMPLES} files`),
  category: z.string().min(1, "A category is required"),
  language: z.string().min(1, "A language is required"),
  description: z.string(),
});

function TrainingSampleRow({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const { isPlaying, togglePlay } = useAudioPlayback(file);
  const isVideo = file.type.startsWith("video/");

  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
        {isVideo ? (
          <FileVideo className="size-5 text-muted-foreground" />
        ) : (
          <FileAudio className="size-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {isVideo ? "Video" : "Audio"} · {formatFileSize(file.size)}
        </p>
      </div>

      <Button type="button" variant="ghost" size="icon-sm" onClick={togglePlay}>
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );
}

function FileDropzone({
  files,
  onFilesChange,
  isInvalid,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  isInvalid?: boolean;
}) {
  const remaining = MAX_TRAINING_SAMPLES - files.length;

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        "audio/*": [],
        "video/*": [".mp4", ".webm", ".mov", ".mkv", ".m4v"],
      },
      maxSize: MAX_SAMPLE_SIZE_BYTES,
      multiple: true,
      maxFiles: remaining,
      disabled: remaining <= 0,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        onFilesChange(
          [...files, ...acceptedFiles].slice(0, MAX_TRAINING_SAMPLES),
        );
      },
    });

  return (
    <div className="flex flex-col gap-3">
      {files.map((file, index) => (
        <TrainingSampleRow
          key={`${file.name}-${file.size}-${index}`}
          file={file}
          onRemove={() =>
            onFilesChange(files.filter((_, i) => i !== index))
          }
        />
      ))}

      {remaining > 0 && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10 transition-colors",
            isDragReject || isInvalid
              ? "border-destructive"
              : isDragActive
                ? "border-primary"
                : "",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <AudioLines className="size-5 text-muted-foreground" />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <p className="text-base font-semibold tracking-tight">
              Upload training clips
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Audio or video, up to {MAX_TRAINING_SAMPLES} files (50MB each).{" "}
              {files.length}/{MAX_TRAINING_SAMPLES} added
            </p>
          </div>

          <Button type="button" variant="outline" size="sm">
            <FolderOpen className="size-3.5" />
            Upload files
          </Button>
        </div>
      )}
    </div>
  );
}

function LanguageCombobox({
  value,
  onChange,
  isInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    LANGUAGE_OPTIONS.find((l) => l.value === value)?.label ?? "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={isInvalid}
          className={cn(
            "h-9 w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            {value ? selectedLabel : "Select language..."}
          </div>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {LANGUAGE_OPTIONS.map((lang) => (
                <CommandItem
                  key={lang.value}
                  value={lang.label}
                  onSelect={() => {
                    onChange(lang.value);
                    setOpen(false);
                  }}
                >
                  {lang.label}
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      value === lang.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface VoiceCreateFormProps {
  scrollable?: boolean;
  footer?: (submit: React.ReactNode) => React.ReactNode;
  onError?: (message: string) => void;
};

export function VoiceCreateForm({
  scrollable,
  footer,
  onError,
}: VoiceCreateFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      files,
      category,
      language,
      description,
    }: {
      name: string;
      files: File[];
      category: string;
      language: string;
      description?: string;
    }) => {
      const trainingFile = await mediaFilesToWav(files);
      const params = new URLSearchParams({
        name,
        category,
        language,
      });
      if (description) {
        params.set("description", description);
      }

      const response = 
        await fetch(`/api/voices/create?${params.toString()}`, {
          method: "POST",
          headers: { "Content-Type": trainingFile.type },
          body: trainingFile,
        });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to create voice");
      }

      return response.json();
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      files: [] as File[],
      category: "GENERAL" as string,
      language: "en-US",
      description: "",
    },
    validators: {
      onSubmit: voiceCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
         await createMutation.mutateAsync({
          name: value.name,
          files: value.files,
          category: value.category,
          language: value.language,
          description: value.description || undefined,
         });

         toast.success("Voice created successfully!");
         queryClient.invalidateQueries({
          queryKey: trpc.voices.getAll.queryKey(),
        });
        form.reset();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create voice";
        
        if (onError) {
          onError(message);
        } else {
          toast.error(message);
        }
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn(
        "flex flex-col", 
        scrollable ? "min-h-0 flex-1" : "gap-6"
      )}
    >
      <div
        className={cn(
          scrollable
            ? "no-scrollbar flex flex-col gap-6 overflow-y-auto px-4"
            : "flex flex-col gap-6",
        )}
      >
        <form.Field name="files">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <Tabs defaultValue="upload">
                  <TabsList className="h-11! w-full">
                    <TabsTrigger value="upload">
                      <Upload className="size-3.5" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="record">
                      <Mic className="size-3.5" />
                      Record
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <FileDropzone
                      files={field.state.value}
                      onFilesChange={field.handleChange}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>
                  <TabsContent value="record">
                    <VoiceRecorder
                      files={field.state.value}
                      onFilesChange={field.handleChange}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>
                </Tabs>
                {isInvalid 
                  && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <Tag className="size-4 text-muted-foreground" />
                  </div>
                  <Input
                    id={field.name}
                    placeholder="Voice Label"
                    aria-invalid={isInvalid}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="pl-10"
                  />

                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="category">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
<div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <Layers className="size-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue 
                        placeholder="Select category..."
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {VOICE_CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="language">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <LanguageCombobox
                  value={field.state.value}
                  onChange={field.handleChange}
                  isInvalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <AlignLeft className="size-4 text-muted-foreground" />
                  </div>
                  <Textarea
                    id={field.name}
                    placeholder="Describe this voice..."
                    aria-invalid={isInvalid}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="min-h-20 pl-10"
                    rows={3}
                  />

                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe
          selector={(s) => ({
            isSubmitting: s.isSubmitting,
          })}
      >
        {({ isSubmitting }) => {
          const submitButton = (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Voice"}
            </Button>
          );

          return footer ? footer(submitButton) : submitButton;
        }}
      </form.Subscribe>
      </div>
    </form>
  )
};