import { PackageOpen, Pencil } from "lucide-react";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import UnitBadge from "@/components/UnitBadge";
import { cx } from "class-variance-authority";
import { Fragment } from "react/jsx-runtime";
import { Product } from "@/types";

function ProductItem({
  product,
  sub = false,
  onSelect,
  onToggle,
}: {
  product: Product;
  sub?: boolean;
  onSelect: (product: Product) => void;
  onToggle: (toggle: {
    newPackageModal?: boolean;
    editModal?: boolean;
  }) => void;
}) {
  return (
    <div className={cx("flex gap-4 items-center", { "pl-4": sub })}>
      <div className={cx({ "font-semibold": !sub }, { "text-primary": sub })}>
        {product.name}
      </div>
      <UnitBadge unit={product.unit as keyof typeof UNIT_COLOR} />
      <div className="flex gap-2 ml-auto items-center">
        <div className="w-20 justify-end flex gap-2">
          {!sub && (
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                onSelect(product);
                onToggle({ newPackageModal: true });
              }}
            >
              <PackageOpen />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              onSelect(product);
              onToggle({ editModal: true });
            }}
          >
            <Pencil />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductList({
  products,
  ...props
}: {
  products: Product[];
  onSelect: (product: Product) => void;
  onToggle: (toggle: {
    newPackageModal?: boolean;
    editModal?: boolean;
  }) => void;
}) {
  return (
    <>
      {products.map((product) => (
        <Fragment key={product.id}>
          <ProductItem product={product} {...props} />

          {product?.subProducts?.map((subItem: Product) => {
            return (
              <Fragment key={subItem.id}>
                <ProductItem product={subItem} sub={true} {...props} />
              </Fragment>
            );
          })}
        </Fragment>
      ))}
    </>
  );
}
