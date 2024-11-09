import { DeliveryOrderStatus, Order, OrderStatus } from "@prisma/client";
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
import { useState } from "react";
import { Input } from "../ui/input";
import { Pagination } from "../shared/pagination";
import { useStaffRoles } from "~/hooks/use-staff-roles";

export function OrderTable({
  orders,
}: {
  orders: Awaited<ReturnType<typeof getOrders>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const roles = useStaffRoles();
  const filteredOrders = orders.filter(
    (order) =>
      order.customer.fullname
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Tìm theo tên KH hoặc mã đơn..."
          className="max-w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
          {paginatedOrders.map((order) => (
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
                <div className="flex gap-2">
                  {roles?.some((role) => role.name === "Admin") && (
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/admin/orders/${order.id}`}>
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                  {roles?.some((role) => role.name === "Chef") && (
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/admin/chef/orders/${order.id}`}>
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}
