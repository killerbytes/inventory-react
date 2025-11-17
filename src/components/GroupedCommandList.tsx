import React, { useMemo, useRef, useEffect, memo, useCallback } from "react";
import { formatCurrency, getScore } from "@/utils/formatters";
import { CommandGroup, CommandItem } from "./ui/command";
import { UNIT_COLOR } from "@/utils/definitions";
import HighlightMatch from "./HighlightMatch";
import ColorBadge from "./ColorBadge";

interface Item {
  id: string | number;
  name: string;
  unit: string;
  price: number;
  group?: string;
}

interface Props {
  items: Item[];
  search: string;
  onSelect?: (item: Item) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedId?: string | number;
}

// Memoized CommandItem
const MemoizedCommandItem = memo(
  ({
    item,
    selected,
    onSelect,
    search,
  }: {
    item: Item;
    selected: boolean;
    onSelect: () => void;
    search: string;
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
      <CommandItem
        key={item.id}
        value={item.name}
        onSelect={onSelect}
        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-default select-none"
        ref={selected ? ref : undefined}
      >
        <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>

        <div>
          <HighlightMatch text={item.name} query={search} />
        </div>

        <div className="ml-auto flex gap-2">
          <span>{formatCurrency(item.price)}</span>
        </div>
      </CommandItem>
    );
  },
);

export default function GroupedCommandList({
  items,
  search,
  onSelect,
  open,
  setOpen,
  selectedId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Filter, score, and group memoized
  const grouped = useMemo(() => {
    if (!items || items.length === 0) return [];

    const map = new Map<string, Item[]>();
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
              />
            ))}
          </React.Fragment>
        ))}
      </CommandGroup>
    </div>
  );
}
