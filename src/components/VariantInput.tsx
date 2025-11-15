import { Badge } from "@/components/ui/badge";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import { VariantTypes } from "@/types";
import { Plus } from "lucide-react";

const defaultValues: VariantTypes = {
  name: "Colors",
  values: [
    {
      value: "Red",
      variantTypeId: null,
    },
  ],
};
export default function VariantInput({
  value = [],
  onChange,
}: {
  value?: VariantTypes[];
  onChange: (value: VariantTypes[]) => void;
}) {
  const [toggle, handleToggle] = useToggle({
    variantModal: false,
  });
  const form = useForm<VariantTypes>({
    defaultValues,
  });

  const onAdd = () => {
    form.reset(defaultValues);
    handleToggle({ variantModal: true });
  };

  const onEdit = (selected: VariantTypes) => {
    form.reset(selected);
    handleToggle({ variantModal: true });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {value.map((v, index) => (
        <div
          className="flex items-center relative"
          key={index}
          onClick={() => {
            onEdit(v);
          }}
        >
          {v.name}
        </div>
      ))}
      <Badge
        className="py-1 px-2 cursor-pointer"
        variant="outline"
        onClick={() => onAdd()}
      >
        <Plus className="w-4 h-4" />
      </Badge>
    </div>
  );
}
