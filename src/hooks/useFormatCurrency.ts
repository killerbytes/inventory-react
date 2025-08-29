import { useMemo } from "react";

export const useFormatCurrency = () => {
  const formatter = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: import.meta.env.VITE_CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []); // Empty dependency array means it only creates once

  const formatCurrency = (value: number) => {
    return formatter.format(value);
  };

  return formatCurrency;
};
