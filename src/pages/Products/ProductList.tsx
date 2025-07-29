import ProductItem from "./ProductItem";
import { Product } from "@/services";

export default function ProductList({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product) => (
        <>
          <ProductItem product={product} />

          {product?.subProducts?.map((subItem) => {
            return (
              <>
                <ProductItem product={subItem} sub={true} />
              </>
            );
          })}
        </>
      ))}
    </>
  );
}
