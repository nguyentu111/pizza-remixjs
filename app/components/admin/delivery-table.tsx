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

type DeliveryWithDetails = Delivery & {
  shipper: {
    fullname: string;
  };
  orders: {
    id: string;
  }[];
};

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
  const itemsPerPage = 5;

  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.staff.fullname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div>
      <div className="flex items-center mb-6 justify-between">
        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`p-2 !min-w-[40px] ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white rounded"
                  : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="flex">
          <Input
            type="text"
            placeholder="Tìm chuyến giao hàng..."
            className="max-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã lộ trình</TableHead>
            <TableHead>Shipper</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Số đơn hàng</TableHead>
            <TableHead>Thời gian tạo</TableHead>
            {/* <TableHead>Khoảng cách (km)</TableHead> */}
            {/* <TableHead>Thời gian dự kiến</TableHead> */}
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDeliveries.map((delivery) => {
            const status = STATUS_BADGES[delivery.status];
            return (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">
                  {delivery.id.slice(0, 8)}
                </TableCell>
                <TableCell>{delivery.staff.fullname}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>{delivery.DeliveryOrder.length} đơn</TableCell>
                <TableCell>{formatDateTime(delivery.createdAt)}</TableCell>
                {/* <TableCell>
                  {delivery.DeliveryOrder.reduce((acc, curr) => {
                    return acc + Number(curr.order.);
                  }, 0)}
                </TableCell>
                <TableCell>
                  {delivery.DeliveryOrder
                    ? `${Math.round(delivery.estimatedTime / 60)} phút`
                    : "N/A"}
                </TableCell> */}
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
    </div>
  );
}
