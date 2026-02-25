import { NumericFormat } from "react-number-format";
import { Input } from "./ui/input";
import { debounce } from "lodash";
import React from "react";

interface NumberInputProps {
  tabIndex?: number;
  value?: number | null | undefined;
  onChange: (value: number) => void;
  type?: "number" | "currency";
  decimalScale?: number;
  allowNegative?: boolean;
  thousandSeparator?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: _value,
      onChange,
      type = "number",
      decimalScale = 0,
      allowNegative = false,
      thousandSeparator = ",",
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    };

    const debouncedUpdate = React.useMemo(
      () =>
        debounce((val) => {
          onChange(val);
        }, 400),
      [onChange],
    );

    return (
      <NumericFormat
        {...props}
        getInputRef={ref} // ✅ forward the ref to RHF
        value={displayValue || _value}
        onFocus={onFocus}
        onValueChange={(values) => {
          const { floatValue, formattedValue } = values;
          setDisplayValue(formattedValue);
          debouncedUpdate(floatValue);
        }}
        style={{ textAlign: "inherit" }}
        customInput={Input}
        allowNegative={allowNegative}
        decimalScale={decimalScale}
        thousandSeparator={thousandSeparator}
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
