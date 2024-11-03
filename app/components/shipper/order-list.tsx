import { Order } from "@prisma/client";
import { Form, Link, useNavigation } from "@remix-run/react";
import { formatDate, formatPrice } from "~/lib/utils";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useState, useTransition } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Separator } from "../ui/separator";
import { OrderWithDetailsCustomerCoupon } from "~/lib/type";

export function ShipperOrderList({
  orders,
}: {
  orders: OrderWithDetailsCustomerCoupon[];
}) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const navigation = useNavigation();
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };
  const isSubmitting = navigation.state === "submitting";
  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.length === 0 && (
          <div className="text-center text-gray-500">Không có đơn hàng nào</div>
        )}
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedOrders.includes(order.id)}
                onCheckedChange={() => handleOrderSelect(order.id)}
              />

              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      Đơn hàng #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge>Chờ giao hàng</Badge>
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium">
                      {order.customer.fullname}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-medium">
                      {order.customer.phoneNumbers}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {order.address}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thanh toán:</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {order.paymentStatus === "PAID"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </span>
                  </div>
                  {order.shipNote && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ghi chú:</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {order.shipNote}
                      </span>
                    </div>
                  )}
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="items">
                    <AccordionTrigger>
                      Chi tiết đơn hàng ({order.OrderDetail.length} sản phẩm)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {order.OrderDetail.map((detail: any, index: number) => (
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
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Kích thước:
                                  </span>
                                  <span>{detail.size.name}</span>
                                </div>
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

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng tiền hàng:</span>
                    <span className="font-medium">
                      {formatPrice(
                        Number(order.totalAmount) - Number(order.shippingFee),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí giao hàng:</span>
                    <span className="font-medium">
                      {formatPrice(Number(order.shippingFee))}
                    </span>
                  </div>
                  {order.coupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(Number(order.coupon.discount))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(Number(order.totalAmount))}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
