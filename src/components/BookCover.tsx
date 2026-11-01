"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";

interface BookCoverProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export default function BookCover({
  src,
  alt,
  title,
  className,
  imageClassName,
  priority = false,
}: BookCoverProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-muted",
        className
      )}
    >
      {!failed && src ? (
        <img
          src={resolveMediaUrl(src)}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn("size-full object-cover", imageClassName)}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,var(--brand-soft),var(--surface-muted))] px-4 text-center">
          <BookOpen className="size-7 text-brand/70" />
          <span className="line-clamp-3 font-display text-sm font-semibold leading-snug text-ink/80">
            {title || alt}
          </span>
        </div>
      )}
    </div>
  );
}
