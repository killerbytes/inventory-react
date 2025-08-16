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
import { Trash2 } from "lucide-react";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";

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

function DataTable<T>(props) {
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
  }: DataTableProps<T> = props;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    meta,
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

  const handleRemoveSelected = () => {
    const filteredData = table
      .getFilteredRowModel()
      .rows.filter((row) => !row.getIsSelected())
      .map((row) => row.original);
    if (onUpdate) {
      onUpdate(filteredData);
    }
    setRowSelection({});
  };

  return (
    <div className={cx("w-full overflow-auto", className)}>
      {table.getSelectedRowModel().rows.length !== 0 && (
        <div className="flex items-center py-4">
          <Button onClick={handleRemoveSelected} variant="outline">
            <Trash2 />
          </Button>
        </div>
      )}
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
}

export { DataTable };
