import NumberInput from "@/components/NumberInput";
import useDebounce from "@/hooks/useDebounce";
import React from "react";

export default function EditableCell({
  getValue,
  cell,
  row: { index },
  column: { id },
  table,
}) {
  const initialValue = getValue();
  const type = cell.column.columnDef.meta?.type;
  const [value, setValue] = React.useState(initialValue);
  const debouncedValue = useDebounce(value, 500);

  React.useEffect(() => {
    table.options.meta?.updateData(index, id, debouncedValue);
  }, [debouncedValue]);

  return (
    <NumberInput
      value={value}
      type={type}
      onChange={(e) => {
        setValue(e);
      }}
    />
  );
}
