import { useWatch } from "react-hook-form";

export default function useExcludeExistToList(list, control, field) {
  const fields = useWatch({
    control,
    name: field,
  });

  const exclude =
    fields && fields.map((item) => Number(item.combinationId)).filter(Boolean);
  const result = list?.map((category) => {
    const products = category.products.map((product) => {
      return {
        ...product,
        combinations: product.combinations.filter((combination) => {
          return !exclude.includes(Number(combination.id));
        }),
      };
    });
    const productsWithCombo = products.filter((p) => p.combinations.length > 0);
    return products.length > 0
      ? { ...category, products: productsWithCombo }
      : null;
  });

  return result;
}
