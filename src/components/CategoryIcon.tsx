import {
  Baby,
  BookOpen,
  FlaskConical,
  Landmark,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookCategory } from "@/types";

const categoryIcons: Record<BookCategory, LucideIcon> = {
  Fiction: BookOpen,
  Science: FlaskConical,
  History: Landmark,
  Kids: Baby,
  Others: Sparkles,
};

export default function CategoryIcon({
  category,
  className,
}: {
  category: BookCategory;
  className?: string;
}) {
  const Icon = categoryIcons[category] || Sparkles;
  return <Icon className={cn("size-4", className)} />;
}
