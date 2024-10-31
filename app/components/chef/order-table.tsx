import { Order } from "@prisma/client";
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

export function OrderTable({ orders }: { orders: any[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Chờ xử lý</Badge>;
      case "COOKING":
        return <Badge variant="default">Đang chế biến</Badge>;
      case "COOKED":
        return <Badge variant="success">Đã chế biến xong</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
