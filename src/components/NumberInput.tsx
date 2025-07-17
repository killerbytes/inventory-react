import { NumericFormat } from "react-number-format";
import { Input } from "./ui/input";

export default function NumberInput({
  value,
  onChange,
  type = "number",
}: {
  value: number;
  onChange: (value: number) => void;
  type?: "number" | "currency";
}) {
  const onFocus = (e) => {
    e.target.select();
  };

  return (
    <NumericFormat
      value={value}
      onFocus={onFocus}
      onValueChange={(values) => {
        const { floatValue } = values;
        onChange(floatValue ?? 0);
      }}
      style={{ textAlign: "inherit" }}
      customInput={Input}
      thousandSeparator={true}
      {...(type === "currency" && {
        prefix: "₱",
        decimalScale: 2,
        fixedDecimalScale: true,
      })}
    />
  );
}
