import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "--";
  }

  return format(new Date(value), "dd/MM/yyyy HH:mm", {
    locale: vi,
  });
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "--";
  }

  return format(new Date(value), "dd/MM/yyyy", {
    locale: vi,
  });
}

export function getRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Da co loi xay ra.";
}

export function digitsOnly(value?: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}

export function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

export function toPercent(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

