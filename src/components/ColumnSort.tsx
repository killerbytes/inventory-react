import {
  ArrowDownUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { cx } from "class-variance-authority";
import { filterProps } from "@/types";
import { last } from "lodash";

const size = 14;
export default function ColumnSort<T>({
  column,
  filter,
  handleFilterChange,
  children,
  className,
  align = "left",
  sortKey,
}: {
  column: ColumnDef<T, unknown>;
  filter: filterProps;
  handleFilterChange: (filter: filterProps) => void;
  children: React.ReactNode;
  className?: string | string[];
  align?: "left" | "center" | "right";
  sortKey?: string;
}) {
  const columnId = sortKey || last(column.id?.split("_"));

  return (
    <span
      className={cx(
        "flex items-center gap-1 cursor-pointer",
        className,
        align === "right" && "justify-end",
        align === "left" && "justify-start",
        align === "center" && "justify-center",
      )}
      onClick={() => {
        handleFilterChange({
          order: filter.order === "ASC" ? "DESC" : "ASC",
          sort: columnId,
        });
      }}
    >
      {children}
      {filter.sort === columnId && filter.order === "ASC" ? (
        <ArrowUpNarrowWide size={size} />
      ) : (
        filter.sort === columnId && <ArrowDownWideNarrow size={size} />
      )}

      {filter.sort !== columnId && (
        <ArrowDownUp className="opacity-50" size={size} />
      )}
    </span>
  );
}
