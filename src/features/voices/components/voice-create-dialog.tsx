"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { MAX_TRAINING_SAMPLES } from "@/features/voices/data/training";
import { VoiceCreateForm } from "./voice-create-form";

interface VoiceCreateDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function VoiceCreateDialog({
  children,
  open,
  onOpenChange,
}: VoiceCreateDialogProps) {
  const isMobile = useIsMobile();

  const handleError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create custom voice</DrawerTitle>
            <DrawerDescription>
              Upload or record up to {MAX_TRAINING_SAMPLES} short clips. Talk
              like yourself in a quiet room. Ten real takes beat one fake
              narrator voice.
            </DrawerDescription>
          </DrawerHeader>
          <VoiceCreateForm
            scrollable
            onError={handleError}
            footer={(submit) => (
              <DrawerFooter>
                {submit}
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            )}
          />
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Create custom voice</DialogTitle>
          <DialogDescription>
            Upload or record up to {MAX_TRAINING_SAMPLES} short clips. Talk like
            yourself in a quiet room. Ten real takes beat one fake narrator
            voice.
          </DialogDescription>
        </DialogHeader>
        <VoiceCreateForm onError={handleError} />
      </DialogContent>
    </Dialog>
  );
};