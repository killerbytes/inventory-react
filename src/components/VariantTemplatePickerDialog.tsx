import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ApiErrorResponse, VariantTypes } from "@/types";
import { variantTypesServices } from "@/services";
import { toast } from "sonner";
import React from "react";

export default function VariantTemplatePickerDialog({
  openState,
  onSelect,
}: {
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  onSelect: (variantType: VariantTypes) => void;
}) {
  const [isOpen, setIsOpen] = openState;
  const [selected, setSelected] = React.useState<VariantTypes>();
  const loadingState = React.useState(false);
  const [variantTypes, setVariantTypes] = React.useState<VariantTypes[]>([]);
  const getData = React.useCallback(async () => {
    try {
      loadingState[1](true);
      const data = await variantTypesServices.getAll({ q: null });
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

  React.useEffect(() => {
    if (selected) {
      onSelect({ name: selected.name, values: selected.values });
      setIsOpen(false);
    }
  }, [onSelect, selected, setIsOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Variant Templates">
          {variantTypes.map((variantType) => (
            <CommandItem
              key={variantType.id}
              onSelect={() => setSelected(variantType)}
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
