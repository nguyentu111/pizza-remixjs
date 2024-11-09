import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { OrderWithDetailsCustomerCoupon } from "~/lib/type";
import { formatDate, formatPrice } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Search } from "lucide-react";
import { Pagination } from "../shared/pagination";

export function ShipmentOrderTable({
  orders,
}: {
  orders: OrderWithDetailsCustomerCoupon[];
}) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigation = useNavigation();

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

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

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-4">
      {selectedOrders.length > 0 && (
        <div className="sticky top-0 bg-white p-4 shadow rounded-lg z-10">
          <div className="flex justify-between items-center">
            <span>Đã chọn {selectedOrders.length} đơn hàng</span>
            <Form method="POST" action="/admin/ship/delivery/create">
              {selectedOrders.map((orderId) => (
                <input
                  type="hidden"
                  name="orderIds[]"
                  value={orderId}
                  key={orderId}
                />
              ))}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo chuyến giao hàng"}
              </Button>
            </Form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="relative">
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-[300px]"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={
                  selectedOrders.length === paginatedOrders.length &&
                  paginatedOrders.length > 0
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedOrders(paginatedOrders.map((order) => order.id));
                  } else {
                    setSelectedOrders([]);
                  }
                }}
              />
            </TableHead>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => handleOrderSelect(order.id)}
                />
              </TableCell>
              <TableCell>
                <Accordion type="single" collapsible>
                  <AccordionItem value={order.id} className="border-none">
                    <AccordionTrigger className="hover:no-underline">
                      #{order.id.slice(0, 8)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 mt-4">
                        {order.OrderDetail.map((detail, index) => (
                          <div key={detail.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="grid gap-2">
                              <div className="flex items-center gap-4">
                                <img
                                  src={detail.product.image || ""}
                                  alt={detail.product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                  <h4 className="font-medium">
                                    {detail.product.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    x{detail.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="grid gap-1 text-sm">
                                {detail.product.Sizes.length > 1 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Kích thước:
                                    </span>
                                    <span>{detail.size.name}</span>
                                  </div>
                                )}
                                {detail.border && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Viền:</span>
                                    <span>{detail.border.name}</span>
                                  </div>
                                )}
                                {detail.topping && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Topping:
                                    </span>
                                    <span>{detail.topping.name}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium">
                                  <span>Thành tiền:</span>
                                  <span>
                                    {formatPrice(Number(detail.totalAmount))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customer.fullname}</p>
                  <p className="text-sm text-gray-500">
                    {order.customer.phoneNumbers}
                  </p>
                </div>
              </TableCell>
              <TableCell>{order.address}</TableCell>
              <TableCell>{formatPrice(Number(order.totalAmount))}</TableCell>
              <TableCell>
                {order.paymentStatus === "PAID" ? (
                  <Badge variant="success">Đã thanh toán</Badge>
                ) : (
                  <Badge variant="destructive">Chưa thanh toán</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
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
