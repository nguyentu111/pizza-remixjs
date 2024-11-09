import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Truck, Clock, RotateCcw, AlertTriangle } from "lucide-react";
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
import { formatDuration } from "~/lib/utils";

interface DeliveryStats {
  statusDistribution: {
    status: string;
    count: number;
  }[];
  averageDeliveryTime: number; // in minutes
  totalDeliveries: number;
  returnedOrders: {
    total: number;
    reasons: {
      reason: string;
      count: number;
    }[];
  };
  recentReturns: Array<{
    orderId: string;
    customerName: string;
    reason: string;
    returnDate: Date;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  SHIPPING: "Đang giao",
  COMPLETED: "Đã giao",
  CANCELLED: "Đã hủy",
  PENDING: "Chờ giao",
};

export function DeliveryStatsCard({ stats }: { stats: DeliveryStats }) {
  const chartData = stats.statusDistribution.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
  }));

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      className="col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>Thống kê vận chuyển</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng đơn giao</p>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Thời gian giao trung bình
              </p>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <p className="text-2xl font-bold">
                  {formatDuration(stats.averageDeliveryTime * 60 * 1000)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Đơn bị trả lại</p>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-500" />
                <p className="text-2xl font-bold">
                  {stats.returnedOrders.total}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Trạng thái đơn hàng</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#8884d8"
                      name="Số lượng đơn hàng"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Lý do trả hàng</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lý do</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.returnedOrders.reasons.map((reason) => (
                    <TableRow key={reason.reason}>
                      <TableCell>{reason.reason}</TableCell>
                      <TableCell className="text-right">
                        {reason.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <h3 className="font-semibold mt-6 mb-4">Đơn trả gần đây</h3>
              <div className="space-y-4 max-h-[200px] overflow-y-auto">
                {stats.recentReturns.map((order) => (
                  <div
                    key={order.orderId}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{order.customerName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.returnDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      <p className="text-sm">{order.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
