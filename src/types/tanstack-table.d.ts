// src/types/tanstack-table.d.ts
import { ColumnMeta } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    headerClassName?: string;
    className?: string;
  }
}
