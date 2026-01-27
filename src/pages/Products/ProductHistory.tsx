import {
  ApiErrorResponse,
  filterProps,
  InventoryMovement,
  PaginatedResponse,
} from "@/types";
import { PAGINATION, PAGINATION_RESPONSE } from "@/utils/definitions";
import Movements from "@/components/Movements";
import { inventoryServices } from "@/services";
import Pager from "@/components/Pager";
import React from "react";

export default function ProductHistory({
  productName,
  selectedCombination,
  isBreakPackFilter,
}: {
  productName: string;
  selectedCombination: { id: number | string; name: string };
  isBreakPackFilter: boolean;
}) {
  const [data, setData] =
    React.useState<PaginatedResponse<InventoryMovement>>(PAGINATION_RESPONSE);

  const [filter, setFilter] = React.useState<filterProps>({
    limit: 999,
    page: PAGINATION.PAGE,
    type: "ALL",
  });

  const getData = React.useCallback(async () => {
    try {
      const payload = {
        ...filter,
        q:
          selectedCombination.id === -1
            ? productName
            : isBreakPackFilter
              ? productName
              : selectedCombination.name,
        type: filter.type === "ALL" ? undefined : filter.type,
      };

      const data = await inventoryServices.getMovements(payload);
      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.error("Error fetching data:", apiError.message);
    }
  }, [
    filter,
    selectedCombination.id,
    selectedCombination.name,
    productName,
    isBreakPackFilter,
  ]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const filterData = React.useMemo(() => {
    if (selectedCombination.id === -1) {
      return data.data || [];
    }

    return isBreakPackFilter
      ? data.data?.filter((item) =>
          item.combination.values.find(
            (item) => item.id === selectedCombination.id,
          ),
        )
      : data.data?.filter(
          (item) => item.combination.name === selectedCombination.name,
        ) || [];
  }, [
    data,
    isBreakPackFilter,
    selectedCombination.id,
    selectedCombination.name,
  ]);

  return (
    <>
      <Movements data={filterData} />
      {data.meta.totalPages > 1 && (
        <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
      )}
    </>
  );
}
