import { NumericFormat } from "react-number-format";
import { Input } from "./ui/input";

export default function NumberInput({
  value,
  onChange,
  type = "number",
  ...props
}: {
  value: number | null | undefined;
  onChange: (value: number) => void;
  type?: "number" | "currency";
}) {
  const onFocus = (e) => {
    e.target.select();
  };

  return (
    <NumericFormat
      {...props}
      value={value}
      onFocus={onFocus}
      onValueChange={(values) => {
        console.log(values);
        const { floatValue } = values;
        onChange(floatValue ?? 0);
      }}
      style={{ textAlign: "inherit" }}
      customInput={Input}
      allowNegative={false} // optional, no negatives
      decimalScale={0} // ✅ no decimals
      thousandSeparator=","
      {...(type === "currency" && {
        prefix: "₱",
        decimalScale: 2,
        fixedDecimalScale: true,
      })}
    />
  );
}
