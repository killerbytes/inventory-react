import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Inventory } from "@/types";
import { useMemo } from "react";

export default function ItemList({
  data,
  columns,
}: {
  columns: ColumnDef<Inventory>[];
  data: {
    categoryId: string;
    categoryName: string;
    inventories: Inventory[];
  }[];
}) {
  const values = useMemo(() => data.map((item) => item.categoryId), [data]);

  return (
    <>
      <Accordion type="multiple" className="w-full" defaultValue={values}>
        {data.map((item) => (
          <AccordionItem value={item.categoryId}>
            <AccordionTrigger>{item.categoryName}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <DataTable data={item.inventories || []} columns={columns} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
