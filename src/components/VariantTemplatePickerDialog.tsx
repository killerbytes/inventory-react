import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ApiErrorResponse, VariantTypes } from "@/schemas";
import { variantTypesServices } from "@/services";
import { toast } from "sonner";
import React from "react";

export default function VariantTemplatePickerDialog({
  isOpen,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  onSelect: (variantType: VariantTypes) => void;
  onClose: () => void;
}) {
  const loadingState = React.useState(false);
  const [variantTypes, setVariantTypes] = React.useState<VariantTypes[]>([]);
  const getData = React.useCallback(async () => {
    try {
      loadingState[1](true);
      const data = await variantTypesServices.getAll({ q: undefined });
      setVariantTypes(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed: " + apiError.message);
    } finally {
      loadingState[1](false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      getData();
    }
  }, [getData, isOpen]);

  // React.useEffect(() => {
  //   if (selected) {
  //     onSelect({ name: selected.name, values: selected.values });
  //     onClose();
  //   }
  // }, [onClose, onSelect, selected]);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Variant Templates">
          {variantTypes.map((variantType) => (
            <CommandItem
              key={variantType.id}
              onSelect={() => {
                onSelect(variantType);
                onClose();
              }}
            >
              <span className="font-semibold">{variantType.name}</span>
              {variantType.values.map(({ value }) => (
                <span className="text-muted-foreground">{value}</span>
              ))}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
