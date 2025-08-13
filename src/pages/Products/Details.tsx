import { productServices } from "@/services";
import { useParams } from "react-router";
import React from "react";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = React.useState<any>();

  React.useEffect(() => {
    const getData = async () => {
      const data = await productServices.get(id);
      setProduct(data);
    };
    getData();
  }, [id]);

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {product?.name}
      </h4>
    </div>
  );
}
