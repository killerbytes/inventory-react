import { useMemo } from "react";

export const useFormatCurrency = () => {
  const formatter = useMemo(() => {
    const rawCurrency = import.meta.env.VITE_CURRENCY;
    const currency =
      typeof rawCurrency === "string" && rawCurrency.trim()
        ? rawCurrency.trim()
        : "PHP";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []); // Empty dependency array means it only creates once

  const formatCurrency = (value: number) => {
    return formatter.format(value);
  };

  return formatCurrency;
};
