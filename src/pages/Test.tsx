import ProductLookupInput from "@/components/forms/ProductLookupInput";
import { useForm } from "react-hook-form";
import { SalesOrder } from "@/schemas";

export default function Test() {
  const form = useForm<SalesOrder>({
    defaultValues: {
      salesOrderItems: [
        {
          combinations: {
            name: "test",
          },
        },
      ],
    },
  });
  return (
    <div>
      <ProductLookupInput
        index={0}
        form={form}
        name="salesOrderItems"
        onChange={() => {
          console.log("changed");
        }}
      />
    </div>
  );
}
