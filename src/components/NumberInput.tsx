import { NumericFormat } from "react-number-format";
import useDebounce from "@/hooks/useDebounce";
import React from "react";

export default function NumberInput({
  value,
  onChange,
  // onUpdate,
  type = "number",
}: {
  value: number;
  onChange: (value: number) => void;
  // onUpdate: () => void;
  type?: "number" | "currency";
}) {
  const onFocus = (e) => {
    e.target.select();
  };

  // console.log(value);
  return (
    <NumericFormat
      value={value}
      // onBlur={onUpdate}
      onFocus={onFocus}
      // onKeyDown={(e) => {
      //   if (e.key === "Enter") {
      //     onUpdate();
      //   }
      // }}
      onValueChange={(values) => {
        const { floatValue } = values;
        onChange(floatValue ?? 0);
      }}
      style={{ textAlign: "inherit" }}
      className="px-2 py-1 border border-gray-300 rounded-md"
      thousandSeparator={true}
      {...(type === "currency" && {
        prefix: "₱",
        decimalScale: 2,
        fixedDecimalScale: true,
      })}
    />
  );
}
