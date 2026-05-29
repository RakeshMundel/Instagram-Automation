import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

export function paginate(searchParams: URLSearchParams) {
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function replaceVariables(template: string, variables: Record<string, string | undefined>) {
  return Object.entries(variables).reduce((message, [key, value]) => {
    return message.replaceAll(`{{${key}}}`, value ?? "");
  }, template);
}
