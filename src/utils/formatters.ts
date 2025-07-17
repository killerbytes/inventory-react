import { format } from "date-fns";

import {
  DATE_FORMAT,
  DATETIME_FORMAT,
  ORDER_STATUS,
  STATUS,
} from "./definitions";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: import.meta.env.VITE_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (value: string) => {
  return value && format(value, DATE_FORMAT);
};

export const formatDateTime = (
  value: string,
  formatStr: string = DATETIME_FORMAT,
) => {
  return value && format(value, formatStr);
};

export const getStatus = (status: string | null | undefined, next = false) => {
  if (status) {
    return next
      ? ORDER_STATUS[
          STATUS[STATUS.indexOf(status) + 1] as keyof typeof ORDER_STATUS
        ]
      : ORDER_STATUS[status as keyof typeof ORDER_STATUS];
  }
  return { label: "-", description: "-" };
};
