import {
  ApiErrorResponse,
  filterProps,
  InventoryMovement,
  PaginatedResponse,
  ProductCombination,
} from "@/schemas";
import { PAGINATION, PAGINATION_RESPONSE } from "@/utils/definitions";
import Movements from "@/components/Movements";
import { inventoryServices } from "@/services";
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

  const [data, setData] =
    React.useState<PaginatedResponse<InventoryMovement>>(PAGINATION_RESPONSE);

  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    type: "ALL",
  });

  const getData = React.useCallback(async () => {
    try {
      const payload = {
        ...filter,
        ids: combinations.map((i) => i.id),
        type: filter.type === "ALL" ? undefined : filter.type,
      };

      const data = await inventoryServices.getMovements(payload);
      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.error("Error fetching data:", apiError.message);
    }
  }, [filter, selectedCombination, productName]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      <Movements data={data.data || []} />
      {data.meta.totalPages > 1 && (
        <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
      )}
    </>
  );
}
