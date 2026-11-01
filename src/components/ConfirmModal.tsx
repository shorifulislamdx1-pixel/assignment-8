"use client";

import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl text-center">
        <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted">{message}</p>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}