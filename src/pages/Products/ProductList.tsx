import ProductItem from "./ProductItem";
import { Product } from "@/services";

export default function ProductList({
  products,
  ...props
}: {
  products: Product[];
  onSelect: (product: Product) => void;
  onToggle: (toggle: { string: boolean }) => void;
}) {
  return (
    <>
      {products.map((product) => (
        <>
          <ProductItem product={product} {...props} />

          {product?.subProducts?.map((subItem: Product) => {
            return (
              <>
                <ProductItem product={subItem} sub={true} {...props} />
              </>
            );
          })}
        </>
      ))}
    </>
  );
}
