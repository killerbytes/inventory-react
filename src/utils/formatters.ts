import { format } from "date-fns";

import { DATE_FORMAT, DATETIME_FORMAT } from "./definitions";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: import.meta.env.VITE_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (value?: string | null) => {
  return value ? format(value, DATE_FORMAT) : "";
};

export const formatDateTime = (
  value?: string | null,
  formatStr: string = DATETIME_FORMAT,
) => {
  return value ? format(value, formatStr) : "";
};

export const getScore = (value: string, search: string) => {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9 ]/gi, " ")
      .trim();

  const v = normalize(value);
  const s = normalize(search);

  if (!s) return 1;

  if (v === s) return 100;
  if (v.startsWith(s)) return 80;
  if (v.includes(s)) return 50;

  const searchWords = s.split(/\s+/).filter(Boolean);
  let matched = 0;
  for (const word of searchWords) {
    if (v.includes(word)) matched++;
  }

  if (matched === searchWords.length) return 40;
  if (matched > 0) return 20;

  return 0;
};
