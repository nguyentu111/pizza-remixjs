import { Delivery, DeliveryStatus } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { formatDateTime } from "~/lib/utils";
import { getDeliveries } from "~/models/delivery.server";
import { Pagination } from "../shared/pagination";

const STATUS_BADGES: Record<
  DeliveryStatus,
  { label: string; variant: "default" | "success" | "destructive" }
> = {
  SHIPPING: { label: "Đang giao", variant: "default" },
  COMPLETED: { label: "Hoàn thành", variant: "success" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

export function DeliveryTable({
  deliveries,
}: {
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.staff.fullname
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      delivery.DeliveryOrder.find((order) =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const totalItems = filteredDeliveries.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Tìm chuyến giao hàng..."
          className="max-w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã lộ trình</TableHead>
            <TableHead>Shipper</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Số đơn hàng</TableHead>
            <TableHead>Thời gian tạo</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDeliveries.map((delivery) => {
            const status = STATUS_BADGES[delivery.status];
            return (
              <TableRow key={delivery.id}>
                <TableCell className="">#{delivery.id.slice(0, 8)}</TableCell>
                <TableCell>{delivery.staff.fullname}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>{delivery.DeliveryOrder.length} đơn</TableCell>
                <TableCell>{formatDateTime(delivery.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link to={`/admin/ship/delivery/${delivery.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
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
            setCurrentPage(1); // Reset to first page when changing page size
          }}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}
