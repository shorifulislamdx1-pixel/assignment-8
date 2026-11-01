import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_URL } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function getInitials(name?: string | null) {
  if (!name) return "BN";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function resolveMediaUrl(src: string) {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
  return src;
}

export function daysFromToday(value: string | Date) {
  const target = typeof value === "string" ? new Date(value) : value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const normalized = new Date(target);
  normalized.setHours(0, 0, 0, 0);
  return Math.round(
    (normalized.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function addDaysToDateKey(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
