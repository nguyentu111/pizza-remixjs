import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { OrderStatus } from "@prisma/client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface OrdersCardProps {
  orders: Array<{
    status: OrderStatus;
    _count: number;
  }>;
}
const getOrderStatus = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Đang chờ";
    case OrderStatus.COOKING:
      return "Đang nấu";
    case OrderStatus.COOKED:
      return "Đã nấu";
    case OrderStatus.SHIPPING:
      return "Đang giao";
    case OrderStatus.COMPLETED:
      return "Đã giao";
    case OrderStatus.CANCELLED:
      return "Đã hủy";
    default:
      return status;
  }
};
export function OrdersCard({ orders }: OrdersCardProps) {
  const _orders = orders.map((order) => ({
    status: getOrderStatus(order.status),
    _count: order._count,
  }));
  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      className="col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-4">
            {_orders.reduce((acc, curr) => acc + curr._count, 0)}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={_orders}
                  dataKey="_count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={COLORS[index % COLORS.length]}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {`${_orders[index].status} (${value})`}
                      </text>
                    );
                  }}
                >
                  {_orders.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
