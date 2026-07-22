import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDailySalesOrder } from "@/features/sales-orders/hooks/useSalesOrders";
import { formatCurrency } from "@/utils/formatters";

export default function WeeklySalesGraph() {
  const { data, isLoading } = useDailySalesOrder();

  return (
    <div className="flex flex-col gap-2 h-full min-h-[300px]">
      <h1 className="font-semibold">Weekly Sales</h1>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data ?? []}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis
            width="auto"
            dataKey="totalAmount"
            tickFormatter={(value) => formatCurrency(Number(value))}
            fontSize={12}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          {/* <Legend /> */}
          <Bar
            dataKey="totalAmount"
            fill="var(--chart-1)"
            radius={[10, 10, 0, 0]}
            activeBar={{ fill: "var(--chart-2)" }}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
