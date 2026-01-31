// Add 'React' to the import for forwardRef and useImperativeHandle
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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
import { formatCurrency } from "@/utils/formatters";
import { cx } from "class-variance-authority";
import * as React from "react"; // Ensure React is imported

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: object[];
  defaultColumn?: ColumnDef<T>;
  meta?: {
    disabledRow?: Record<string, boolean>;
  };
  emptyText?: string;
  tableClassname?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  onUpdate?: (data: T[]) => void;
  showHeader?: boolean;
  showFooter?: boolean;
  renderFooter?: (data: T[]) => React.ReactNode;
  onSelectionChange?: (selectedItems: T[]) => void;
  defaultSelected?: T[];
};

const defaultRenderFooter = <T,>(data: T[]) => {
  console.log(data);
  return (
    <TableRow>
      <TableCell className="font-semibold">Total</TableCell>
      <TableCell colSpan={99} className="font-semibold text-right">
        {formatCurrency(
          data.reduce(
            (acc: number, item: T) =>
              acc + Number((item as any).totalAmount ?? "0"),
            0,
          ),
        )}
      </TableCell>
    </TableRow>
  );
};

// Wrap the component with React.forwardRef and add `ref` to the arguments
const DataTable = <T,>(props: DataTableProps<T>) => {
  const {
    data,
    columns,
    defaultColumn,
    meta,
    emptyText = "No results found",
    tableClassname,
    className,
    onRowClick,
    onUpdate,
    showHeader = true,
    showFooter = false,
    renderFooter = defaultRenderFooter,
    onSelectionChange,
    defaultSelected = [],
  } = props;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
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
    defaultColumn,
    meta,
    getRowId: (row: any) => row.id, // or customize if your type has a different id
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
  });

  React.useEffect(() => {
    if (!onSelectionChange) return;

    const selectedItems = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);

    onSelectionChange(selectedItems);
  }, [rowSelection]);

  const [disabledKey, disabledValue] = meta?.disabledRow
    ? Object.entries(meta.disabledRow)[0]
    : [null, null];

  return (
    <div className={cx("w-full overflow-auto", className)}>
      <div
        className={cx(
          "rounded-md border overflow-hidden",
          tableClassname && tableClassname,
        )}
      >
        <Table className="overflow ">
          {showHeader && (
            <TableHeader className="text-xs ">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      // style={{ width: `${header.getSize()}px` }}
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
          )}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isDisabled = disabledKey
                  ? Boolean(
                      disabledKey
                        .split(".")
                        .reduce(
                          (acc: unknown, key) =>
                            (acc as Record<string, unknown>)?.[key],
                          row.original,
                        ),
                    ) == Boolean(disabledValue)
                  : null;

                return (
                  <TableRow
                    className={cx(
                      { "cursor-pointer": onRowClick && !isDisabled },
                      isDisabled
                        ? "pointer-events-none bg-muted text-muted-foreground opacity-50 text-red-500"
                        : "hover:bg-muted/50",
                    )}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      if (!isDisabled) {
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
                <TableCell
                  colSpan={columns.length}
                  className="h-12 text-center"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {showFooter && <TableFooter>{renderFooter(data)}</TableFooter>}
        </Table>
      </div>
    </div>
  );
};

export { DataTable };
