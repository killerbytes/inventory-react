import React, { memo, useEffect, useMemo, useRef } from "react";
import { formatCurrency, getScore } from "@/utils/formatters";
import { CommandGroup, CommandItem } from "./ui/command";
import { useCategories } from "@/hooks/useCategories";
import { ProductCombinationSearch } from "@/schemas";
import { UNIT_COLOR } from "@/utils/definitions";
import HighlightMatch from "./HighlightMatch";
import ColorBadge from "./ColorBadge";
import { Badge } from "./ui/badge";

export type BaseProps = Pick<
  ProductCombinationSearch,
  "id" | "name" | "unit" | "price"
> & {
  productId?: number;
  inventory?: { quantity?: number; product?: any } | null;
};

const MemoizedCommandItem = memo(
  <T extends BaseProps>({
    item,
    selected,
    onSelect,
    search,
    disableNoQuantity,
    categoryId = item?.inventory?.product?.categoryId,
  }: {
    item: T;
    selected?: boolean;
    onSelect: () => void;
    search: string;
    disableNoQuantity?: boolean;
    categoryId?: number;
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const name = item.name.replace(/\*\*\*[\s\S]*?\*\*\*/g, "").trim();
    const { data: category } = useCategories();

    const mappedCategory = new Map(category?.map((item) => [item.id, item]));

    useEffect(() => {
      if (!selected || !ref.current) return;
      setTimeout(() => {
        ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 0);
    }, [selected]);

    return (
      <CommandItem
        key={item.id}
        value={name + item.unit}
        onSelect={onSelect}
        ref={selected ? ref : undefined}
        disabled={disableNoQuantity && Number(item.inventory?.quantity) === 0}
      >
        <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>

        <div className="flex flex-col w-full">
          <span className="text-[9px] uppercase text-muted-foreground leading-none">
            {categoryId && mappedCategory.get(categoryId)?.name}
          </span>
          <div>
            <HighlightMatch text={name} query={search || ""} />
          </div>
        </div>

        <Badge
          className="ml-auto"
          variant={item.inventory?.quantity === 0 ? "destructive" : "default"}
        >
          {Number(item.inventory?.quantity)}
        </Badge>
        <span className="w-1/4 text-right font-bold">
          {formatCurrency(item.price || 0)}
        </span>
      </CommandItem>
    );
  },
);

export default function GroupedCommandList<T extends BaseProps>({
  items,
  search,
  onSelect,
  open,
  setOpen,
  selectedId,
  heading,
  disableNoQuantity = false,
}: {
  items: T[];
  search: string;
  onSelect?: (item: T) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedId?: string | number;
  heading?: string;
  disableNoQuantity?: boolean;
}) {
  // Filter, score, and group memoized
  const grouped = useMemo(() => {
    if (!items || items.length === 0) return [];

    const map = new Map<string, T[]>();
    for (const item of items) {
      const score = getScore(item.name, search);
      if (score <= 0) continue;

      const key = "Others";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    // Optional: sort items within each group by score descending
    for (const [_, groupItems] of map) {
      groupItems.sort(
        (a, b) => getScore(b.name, search) - getScore(a.name, search),
      );
    }

    return Array.from(map.entries());
  }, [items, search]);

  if (!open) return null;

  return (
    <div className="max-h-[80%] overflow-auto">
      <CommandGroup heading={heading}>
        {grouped.map(([groupName, groupItems]) => (
          <React.Fragment key={groupName}>
            {groupItems.map((item) => {
              return (
                <MemoizedCommandItem
                  key={item.id}
                  item={item}
                  search={search}
                  selected={String(selectedId) === String(item.id)}
                  onSelect={() => {
                    setOpen(false);
                    onSelect?.(item);
                  }}
                  disableNoQuantity={disableNoQuantity}
                />
              );
            })}
          </React.Fragment>
        ))}
      </CommandGroup>
    </div>
  );
}
