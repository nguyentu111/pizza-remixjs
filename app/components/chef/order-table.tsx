import {
  DeliveryOrderStatus,
  DeliveryStatus,
  Order,
  OrderStatus,
} from "@prisma/client";
import { Link } from "@remix-run/react";
import { EyeIcon } from "lucide-react";
import { formatDate, formatPrice } from "~/lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getOrders } from "~/models/order.server";

export function OrderTable({
  orders,
}: {
  orders: Awaited<ReturnType<typeof getOrders>>;
}) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Chờ xử lý</Badge>;
      case "COOKING":
        return <Badge variant="default">Đang chế biến</Badge>;
      case "COOKED":
        return <Badge variant="success">Đã chế biến xong</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Đã giao hàng</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "SHIPPING":
        return <Badge variant="default">Đang giao hàng</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  const getShipStatusBadge = (status?: DeliveryOrderStatus) => {
    switch (status) {
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "SHIPPING":
        return <Badge variant="default">Đang giao hàng</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Đã giao hàng</Badge>;
      case "PENDING":
      default:
        return <Badge>Đang chờ</Badge>;
    }
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã đơn</TableHead>
          <TableHead>Khách hàng</TableHead>
          <TableHead>Tổng tiền</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thanh toán</TableHead>
          <TableHead>Giao hàng</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>#{order.id.slice(0, 8)}</TableCell>
            <TableCell>{order.customer.fullname}</TableCell>
            <TableCell>{formatPrice(Number(order.totalAmount))}</TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell>
              {order.paymentStatus === "PAID" ? (
                <Badge variant="success">Đã thanh toán</Badge>
              ) : (
                <Badge variant="destructive">Chưa thanh toán</Badge>
              )}
            </TableCell>
            <TableCell>
              {getShipStatusBadge(order.DeliveryOrder?.status)}
            </TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>
              <Button asChild variant="ghost">
                <Link to={`/admin/chef/orders/${order.id}`}>
                  <EyeIcon className="w-4 h-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
