import { ApiError, ApiErrorResponse } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatLabel(str: string) {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getErrorMessage(error: ApiErrorResponse) {
  const { errors, message } = error;
  switch (error.code) {
    case "ERR_NETWORK":
      return "Network error occurred";
    case "INTERNAL_ERROR":
      return { message };
    case "VALIDATION_ERROR":
      return { errors };
    default:
      return "Unknown error occurred";
  }
}
