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
import { cx } from "class-variance-authority";
import * as React from "react"; // Ensure React is imported

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  defaultColumn?: ColumnDef<T>;
  meta?: any;
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

const defaultRenderFooter = (data: any[]) => {
  return (
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">
        {/* {formatCurrency(total?.amount)} */}
      </TableCell>
      <TableCell className="text-right"></TableCell>
      <TableCell className="text-right"></TableCell>
      <TableCell className="text-right ">
        {/* {formatCurrency(total?.discount)} */}
      </TableCell>
      <TableCell className="text-right"></TableCell>
      <TableCell className="text-right">
        {/* {formatCurrency(total?.amount - total?.discount)} */}
      </TableCell>
    </TableRow>
  );
};

// Wrap the component with React.forwardRef and add `ref` to the arguments
const DataTable = React.forwardRef(function DataTable<T>(
  props: DataTableProps<T>,
  ref: React.ForwardedRef<any>, // Define the ref type
) {
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
    const initialSelectedRows = defaultSelected?.reduce((acc, row) => {
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
    getRowId: (row) => row.id,

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
    // Only call the callback if it's provided as a prop
    if (onSelectionChange) {
      const selectedItems = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedItems);
    }
  }, [onSelectionChange, rowSelection, table]); // A

  // Use `useImperativeHandle` to expose the table instance
  React.useImperativeHandle(ref, () => table, [table]);

  return (
    <div className={cx("w-full overflow-auto", className)}>
      <div
        className={cx(
          "rounded-md border overflow-hidden",
          tableClassname && tableClassname,
        )}
      >
        <Table className="overflow">
          {showHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
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
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={cx({ "cursor-pointer": onRowClick })}
                  key={row.original.fieldId || row.original.id || row.original}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    onRowClick && onRowClick(row.original);
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
              ))
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
});

export { DataTable };
