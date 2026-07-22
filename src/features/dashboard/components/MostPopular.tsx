import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { usePopularProducts } from "@/features/inventory/hooks/useInventory";
import { PAGINATION, PAGINATION_RESPONSE } from "@/utils/definitions";
import { endOfMonth, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { filterProps } from "@/schemas";
import React from "react";

export default function MostPopular() {
  const [range, setRange] = React.useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: 5,
    page: PAGINATION.PAGE,
    sort: "transactionCount",
  });
  const payload = {
    ...filter,
    ...(range?.from && range?.to && { startDate: range.from }),
    ...(range?.from && range?.to && { endDate: range.to }),
  };

  const { data = PAGINATION_RESPONSE, isLoading } = usePopularProducts(payload);

  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const x = React.useMemo(
    () =>
      data.data.map((item, index) => ({
        name: item.combinations.name,
        value: Number(item.transactionCount),
        fill: COLORS[index % COLORS.length],
      })),
    [data],
  );

  return (
    <div className="flex flex-col gap-2 h-full min-h-[300px]">
      <h1 className="font-semibold">Most Popular</h1>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={x}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="90%"
            innerRadius="70%"
          />
          <Tooltip
            itemStyle={{ fontSize: 12 }}
            contentStyle={{ borderRadius: 8 }}
          />
          <Legend
            itemSorter="dataKey"
            layout="vertical"
            align="right"
            verticalAlign="middle"
            labelStyle={{
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
