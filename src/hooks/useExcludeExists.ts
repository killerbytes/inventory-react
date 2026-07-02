
export default function useExcludeExistToList<T extends { id: number }>(
  combinations: T[],
  exclude?: number[],
): T[] {
  return combinations?.filter((combination) => {
    return !exclude?.includes(Number(combination.id));
  });
}
