import { useMovements } from "@/features/inventory/hooks/useInventory";
import { PAGINATION, PAGINATION_RESPONSE } from "@/utils/definitions";
import { filterProps, ProductCombination } from "@/schemas";
import Movements from "@/components/Movements";
import Pager from "@/components/Pager";
import React from "react";

export default function ProductHistory<T extends { id: number | string }>({
  productName,
  selectedCombination,
  combinations: _combinations,
}: {
  productName: string;
  selectedCombination: T | undefined;
  combinations: ProductCombination[];
}) {
  const combinations = React.useMemo(() => {
    if (!selectedCombination) return _combinations;
    return _combinations.filter((item) => item.id === selectedCombination?.id);
  }, [selectedCombination, _combinations]);

  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    type: "ALL",
  });
  const payload = {
    ...filter,
    ids: combinations.map((i) => i.id),
    type: filter.type === "ALL" ? undefined : filter.type,
  };

  const { data = PAGINATION_RESPONSE, isLoading } = useMovements(payload);

  return (
    <>
      <Movements data={data.data || []} />
      {data.meta.totalPages > 1 && (
        <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
      )}
    </>
  );
}
