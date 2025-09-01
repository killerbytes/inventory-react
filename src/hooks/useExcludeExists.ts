import { Control, FieldValues, useWatch } from "react-hook-form";

export default function useExcludeExistToList<T extends { id: number }>(
  combinations: T[],
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
  const result = combinations?.filter((combination) => {
    return !exclude.includes(Number(combination.id));
  });

  return result;
}
