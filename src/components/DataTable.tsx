import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cx } from "class-variance-authority";
import React from "react";

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  renderFooter?: (data: T[]) => React.ReactNode;
  meta?: {
    disabledRow?: Record<string, boolean | string | number>;
    emptyText?: string;
    subRows?: string;
  };
  onRowClick?: (item: T) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  defaultSelected?: T[];
};

const DataTable = <T,>(props: Props<T>) => {
  const {
    data = [],
    columns,
    renderFooter,
    meta,
    onRowClick,
    onSelectionChange,
    defaultSelected = [],
  } = props;
  const onSelectionChangeRef = React.useRef(onSelectionChange);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const [rowSelection, setRowSelection] = React.useState(() => {
    const initialSelectedRows = defaultSelected?.reduce<
      Record<string, boolean>
    >((acc, row: any) => {
      acc[row.id] = true;
      return acc;
    }, {});
    return initialSelectedRows;
  });

  const table = useReactTable({
    data,
    columns,
    getRowId: (row: any) => {
      return row.id || row.fieldId;
    },
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getSubRows: (row) => (meta?.subRows ? row[meta.subRows] : []),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      rowSelection,
      expanded,
    },
  });

  React.useEffect(() => {
    if (data.length && meta?.subRows) {
      table.toggleAllRowsExpanded(true);
    }
  }, [data, table]);

  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  React.useEffect(() => {
    if (!onSelectionChangeRef.current) return;
    const selectedItems = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);
    onSelectionChangeRef.current?.(selectedItems);
  }, [rowSelection, table]);

  const [disabledKey, disabledValue] = meta?.disabledRow
    ? Object.entries(meta.disabledRow)[0]
    : [null, null];

  return (
    <div className={cx("w-full overflow-auto border shadow rounded-md")}>
      <Table className="overflow bg-white">
        {
          <TableHeader className="text-xs ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.columnDef?.meta?.headerClassName ?? ""
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        }
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isDisabled = disabledKey
                ? disabledKey
                    .split(".")
                    .reduce(
                      (acc: unknown, key) =>
                        (acc as Record<string, unknown>)?.[key],
                      row.original,
                    ) === disabledValue
                : null;

              return (
                <TableRow
                  className={cx(
                    "odd:bg-gray-100",
                    { "cursor-pointer": onRowClick && !isDisabled },
                    isDisabled
                      ? "pointer-events-none bg-muted text-muted-foreground opacity-50"
                      : "hover:bg-gray-300",
                  )}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick?.(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-12 text-center">
                {meta?.emptyText || "No results found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {renderFooter && <TableFooter>{renderFooter(data)}</TableFooter>}
      </Table>
    </div>
  );
};

export { DataTable };
