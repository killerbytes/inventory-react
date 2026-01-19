import {
  ApiErrorResponse,
  filterProps,
  InventoryMovement,
  PaginatedResponse,
  ProductCombinations,
} from "@/types";
import { SelectItem } from "@/components/ui/select";
import { PAGINATION } from "@/utils/definitions";
import Movements from "@/components/Movements";
import { inventoryServices } from "@/services";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import React from "react";

export default function ProductHistory({
  combinations,
}: {
  combinations: ProductCombinations[];
}) {
  const [data, setData] = React.useState<PaginatedResponse<InventoryMovement>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [selectedCombination, setSelectedCombination] =
    React.useState<ProductCombinations>(combinations[0]);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    type: "ALL",
  });
  const getData = React.useCallback(async () => {
    try {
      const payload = {
        ...filter,
        q: selectedCombination?.name,
        type: filter.type === "ALL" ? undefined : filter.type,
      };

      const data = await inventoryServices.getMovements(payload);
      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.error("Error fetching data:", apiError.message);
    }
  }, [filter, selectedCombination]);

  React.useEffect(() => {
    getData();
  }, [getData]);
  const uniqueCombinations = React.useMemo(
    () =>
      combinations.filter(
        (item, index) =>
          combinations.findIndex((i) => i.name === item.name) === index,
      ),
    [combinations],
  );

  return (
    <>
      <Select
        options={uniqueCombinations}
        value={String(selectedCombination?.id)}
        onChange={(value) => {
          const combination = combinations.find((i) => String(i.id) === value);
          setSelectedCombination(combination!);
        }}
        renderOption={(option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.name}
          </SelectItem>
        )}
      />
      <Movements data={data.data} />
      {data.totalPages > 1 && (
        <Pager data={data} filter={filter} setFilter={setFilter} />
      )}
    </>
  );
}
