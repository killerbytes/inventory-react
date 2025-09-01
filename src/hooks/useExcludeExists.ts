import { Control, FieldValues, useWatch } from "react-hook-form";
import { ProductCombinations } from "@/types";

export default function useExcludeExistToList(
  combinations: ProductCombinations[],
  control: Control,
  name: string,
) {
  const fields = useWatch({
    control,
    name,
  });

  const exclude =
    fields &&
    fields
      .map((item: FieldValues) => Number(item.combinationId))
      .filter(Boolean);
  console.log(exclude);

  const result = combinations?.filter((combination) => {
    return !exclude.includes(Number(combination.id));
  });

  return result;
}
