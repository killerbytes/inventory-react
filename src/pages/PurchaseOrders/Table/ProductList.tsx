import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CategorizedProductList, PurchaseOrder } from "@/types";
import { Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import UnitBadge from "@/components/UnitBadge";
import { ChevronsUpDown } from "lucide-react";
import React, { Fragment } from "react";
import { cn } from "@/lib/utils";

export default function ProductList({
  control,
  list,
  value,
  onChange,
  placeholder = "Type to search...",
}: {
  control: Control<PurchaseOrder>;
  list: CategorizedProductList[];
  value: number | string | undefined | null;
  onChange: (selected: string) => void;
  placeholder?: string;
}) {
  const [options, setOptions] = React.useState<CategorizedProductList[]>([]);
  const [open, setOpen] = React.useState(false);
  const fields = useWatch({
    control,
    name: `purchaseOrderItems`,
  });

  React.useEffect(() => {
    const exclude = fields.map((item) => Number(item.productId));
    const items = list.map((item) => {
      const products = item.products.filter((product) => {
        return !exclude.includes(Number(product.id));
      });
      return { ...item, products };
    });

    setOptions(items);
  }, [fields, list]);

  const selected = list
    .map((option) => {
      const found = option.products.find(
        (product) => product.id === Number(value),
      );
      return found ? found : null;
    })
    .filter(Boolean)[0]?.name;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
          )}
        >
          {selected}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            {options.map((item) => (
              <CommandGroup heading={item.categoryName} key={item.categoryName}>
                {item?.products?.map((product) => (
                  <Fragment key={product.name}>
                    <CommandItem
                      keywords={[product.name]}
                      value={String(product.id)}
                      key={product.id}
                      onSelect={(selected) => {
                        onChange(selected);
                        setOpen(false);
                      }}
                      className="flex justify-between"
                    >
                      {product.name}
                    </CommandItem>
                  </Fragment>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
