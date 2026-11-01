"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  loadingLabel = "Working...",
  loading = false,
  destructive = true,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div
            className={
              destructive
                ? "mb-2 grid size-11 place-items-center rounded-xl bg-danger-soft text-danger"
                : "mb-2 grid size-11 place-items-center rounded-xl bg-brand-soft text-brand"
            }
          >
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {loadingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
