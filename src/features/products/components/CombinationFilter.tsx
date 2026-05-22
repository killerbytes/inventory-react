import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";

export type SelectedCombination = {
  id: number;
  name?: string;
  value?: string;
};

export default function CombinationFilter({
  uniqueCombinations,
  selectedCombination,
  setSelectedCombination,
}: {
  uniqueCombinations: SelectedCombination[];
  selectedCombination: SelectedCombination | undefined;
  setSelectedCombination: (value: SelectedCombination) => void;
}) {
  return (
    <>
      {uniqueCombinations.length > 1 && (
        <Combobox<SelectedCombination>
          items={[...uniqueCombinations]}
          itemToStringLabel={(item) => item?.name || ""}
          value={selectedCombination ?? null}
          onValueChange={(value) => {
            setSelectedCombination(value!);
          }}
        >
          <ComboboxInput placeholder="Filter by combination" showClear />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.id} value={item}>
                  <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </>
  );
}
