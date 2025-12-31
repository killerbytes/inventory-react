import { Control, FieldValues, Path, useWatch } from "react-hook-form";
import { ProductCombinations } from "@/types";

export default function useExcludeExistToList<T extends FieldValues>(
  combinations: ProductCombinations[],
  control: Control<T>,
  name: Path<T>,
) {
  const fields = useWatch({
    control,
    name,
  });

  const exclude =
    (fields &&
      fields
        .map((item: FieldValues) => Number(item.combinationId))
        .filter(Boolean)) ||
    [];
  const result = combinations?.filter((combination) => {
    return !exclude.includes(Number(combination.id));
  });

  return result;
}
