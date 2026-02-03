import React, { useMemo, useRef, useEffect, memo, useCallback } from "react";
import { formatCurrency, getScore } from "@/utils/formatters";
import { CommandGroup, CommandItem } from "./ui/command";
import { UNIT_COLOR } from "@/utils/definitions";
import HighlightMatch from "./HighlightMatch";
import ColorBadge from "./ColorBadge";
import { Badge } from "./ui/badge";

interface BaseProps {
  group?: string | null;
  name: string;
  price: number;
  unit: string;
  inventory: { quantity: number };
  id: number;
}

const MemoizedCommandItem = memo(
  <T extends BaseProps>({
    item,
    selected,
    onSelect,
    search,
    disableNoQuantity,
  }: {
    item: T;
    selected: boolean;
    onSelect: () => void;
    search: string;
    disableNoQuantity: boolean;
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
      <CommandItem
        key={item.id}
        value={item.name + item.unit}
        onSelect={onSelect}
        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-default select-none"
        ref={selected ? ref : undefined}
        disabled={disableNoQuantity && Number(item.inventory.quantity) === 0}
      >
        <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>

        <div>
          <HighlightMatch text={item.name} query={search} />
        </div>

        <div className="ml-auto flex gap-2">
          <Badge>{Number(item.inventory.quantity)}</Badge>
          <span className="font-bold">{formatCurrency(item.price)}</span>
        </div>
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
  disableNoQuantity = false,
}: {
  items: T[];
  search: string;
  onSelect?: (item: T) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedId?: string | number;
  disableNoQuantity?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Filter, score, and group memoized
  const grouped = useMemo(() => {
    if (!items || items.length === 0) return [];

    const map = new Map<string, T[]>();
    for (const item of items) {
      const score = getScore(item.name, search);
      if (score <= 0) continue;

      const key = item.group ?? "Others";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    // Optional: sort items within each group by score descending
    for (const [key, groupItems] of map) {
      groupItems.sort(
        (a, b) => getScore(b.name, search) - getScore(a.name, search),
      );
    }

    return Array.from(map.entries());
  }, [items, search]);

  // Smooth scroll to selected item
  const scrollToSelected = useCallback(() => {
    if (!selectedRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const selected = selectedRef.current;
    const offsetTop = selected.offsetTop;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const selectedHeight = selected.offsetHeight;

    if (
      offsetTop < scrollTop ||
      offsetTop + selectedHeight > scrollTop + containerHeight
    ) {
      container.scrollTo({
        top: offsetTop - containerHeight / 2 + selectedHeight / 2,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (open) scrollToSelected();
  }, [selectedId, open, scrollToSelected]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // jump to top
    }
  }, [search]);

  if (!open) return null;

  return (
    <div ref={containerRef} className="max-h-80 overflow-auto">
      <CommandGroup>
        {grouped.map(([groupName, groupItems]) => (
          <React.Fragment key={groupName}>
            {groupItems.map((item) => (
              <MemoizedCommandItem
                key={item.id}
                item={item}
                search={search}
                selected={selectedId === item.id}
                onSelect={() => {
                  setOpen(false);
                  onSelect?.(item);
                }}
                disableNoQuantity={disableNoQuantity}
              />
            ))}
          </React.Fragment>
        ))}
      </CommandGroup>
    </div>
  );
}
