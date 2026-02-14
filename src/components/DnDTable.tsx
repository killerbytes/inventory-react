import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cx } from "class-variance-authority";
import * as React from "react";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { useSortable } from "@dnd-kit/sortable";
import { GripHorizontal } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";

type Props = {
  id: number;
};
const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: String(rowId),
  });
  return (
    <Button {...attributes} {...listeners} variant="ghost" size="icon">
      <GripHorizontal />
    </Button>
  );
};

const DraggableRow = <T extends Props>({ row }: { row: Row<T> }) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: String(row.original.id),
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <TableRow key={row.id} ref={setNodeRef} style={style}>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cell.column.columnDef.meta?.className}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default function DnDTable<T extends Props>({
  className,
  tableClassname,
  columns: _columns,
  data: _data,
  onSubmit,
}: {
  className?: string;
  tableClassname?: string;
  columns: ColumnDef<T>[];
  data: T[];
  onSubmit: (data: T[]) => void;
}) {
  const columns = React.useMemo<ColumnDef<T>[]>(
    () => [
      {
        id: "drag-handle",
        header: "Move",
        cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
        meta: {
          className: "w-10",
        },
      },
      ..._columns,
    ],
    [_columns],
  );
  const [data, setData] = React.useState(_data);
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => String(id)),
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  React.useEffect(() => {
    onSubmit(data);
  }, [data, onSubmit]);

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className={cx("w-full overflow-auto", className)}>
        <div
          className={cx(
            "rounded-md border overflow-hidden",
            tableClassname && tableClassname,
          )}
        >
          <Table className="overflow">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
            <TableBody>
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
      </div>
    </DndContext>
  );
}
