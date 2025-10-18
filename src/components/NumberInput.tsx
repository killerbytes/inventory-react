import { NumericFormat } from "react-number-format";
import { Input } from "./ui/input";
import React from "react";

interface NumberInputProps {
  tabIndex?: number;
  value: number | null | undefined;
  onChange: (value: number) => void;
  type?: "number" | "currency";
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      type = "number",
      decimalScale = 0,
      allowNegative = false,
      ...props
    },
    ref,
  ) => {
    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    };

    return (
      <NumericFormat
        {...props}
        getInputRef={ref} // ✅ forward the ref to RHF
        value={value}
        onFocus={onFocus}
        onValueChange={(values) => {
          const { floatValue } = values;
          onChange(floatValue ?? 0);
        }}
        style={{ textAlign: "inherit" }}
        customInput={Input}
        allowNegative={allowNegative}
        decimalScale={decimalScale}
        thousandSeparator=","
        {...(type === "currency" && {
          prefix: "₱",
          decimalScale: 2,
          fixedDecimalScale: true,
        })}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export default NumberInput;
