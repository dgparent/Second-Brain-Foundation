import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "");
    const path = urlObj.pathname;
    if (domain.length > maxLength - 3) {
      return domain.substring(0, maxLength - 3) + "...";
    }
    const remainingLength = maxLength - domain.length - 3;
    if (path.length > remainingLength) {
      return domain + path.substring(0, remainingLength) + "...";
    }
    return domain + path;
  } catch {
    return url.substring(0, maxLength - 3) + "...";
  }
}

export function normalizeUrl(url: string): string {
  if (!url) return "";
  try {
    const hasProtocol = /^https?:\/\//i.test(url);
    const normalized = new URL(hasProtocol ? url : `https://${url}`);
    normalized.hash = "";
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}
