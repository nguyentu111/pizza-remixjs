import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn, formatPrice } from "~/lib/utils";
import { getCustomerOrders } from "~/models/order.server";
import { requireCustomer } from "~/session.server";
import { prisma } from "~/lib/db.server";
import { StarIcon } from "lucide-react";
import {
  Border,
  Coupon,
  Order,
  OrderDetail,
  Product,
  Rating,
  Size,
  Topping,
} from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const customer = await requireCustomer(prisma, request);
  const orders = await getCustomerOrders(prisma, customer.id);
  return json({ orders });
};

const ORDER_STATUS = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-500",
  },
  COOKING: {
    label: "Đang chế biến",
    color: "bg-blue-500",
  },
  COOKED: {
    label: "Chờ giao hàng",
    color: "bg-green-500",
  },
  SHIPPING: {
    label: "Đang giao",
    color: "bg-purple-500",
  },
  COMPLETED: {
    label: "Đã giao",
    color: "bg-green-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-500",
  },
} as const;

const PAYMENT_STATUS = {
  PENDING: {
    label: "Chưa thanh toán",
    color: "bg-yellow-500",
  },
  PAID: {
    label: "Đã thanh toán",
    color: "bg-green-500",
  },
  WAITING: {
    label: "Đang chờ thanh toán",
    color: "bg-blue-500",
  },
} as const;
type OrderWithDetail = Order & {
  OrderDetail: (OrderDetail & {
    product: Product;
    border: Border;
    topping: Topping;
    size: Size;
  })[];
  coupon: Coupon;
  rating: Rating;
};
export default function OrderHistoryPage() {
  const { orders } = useLoaderData<typeof loader>();

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      </div>
    );
  }
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>
      <Accordion type="single" collapsible className="space-y-4">
        {orders.map((order) => (
          <AccordionItem
            key={order.id}
            value={order.id}
            className="border rounded-lg p-4"
          >
            <AccordionTrigger className="hover:no-underline [&[data-state=open]>div]:mb-4">
              <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    Đơn hàng #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt), "PPp", { locale: vi })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-white",
                      ORDER_STATUS[order.status].color,
                    )}
                  >
                    {ORDER_STATUS[order.status].label}
                  </Badge>
                  {order.paymentStatus && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-white",
                        PAYMENT_STATUS[
                          order.paymentStatus as keyof typeof PAYMENT_STATUS
                        ].color,
                      )}
                    >
                      {
                        PAYMENT_STATUS[
                          order.paymentStatus as keyof typeof PAYMENT_STATUS
                        ].label
                      }
                    </Badge>
                  )}
                  <p className="font-semibold">
                    {formatPrice(Number(order.totalAmount))}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <OrderDetailComponent order={order as any} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
function OrderDetailComponent({ order }: { order: OrderWithDetail }) {
  const tempPrice = order.OrderDetail.reduce((acc, detail) => {
    return acc + Number(detail.totalAmount);
  }, 0);
  return (
    <div className="space-y-4">
      {/* Order Details */}
      <div className="space-y-2">
        {order.OrderDetail.map((detail, index) => (
          <div key={detail.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={detail.product.image || ""}
              alt={detail.product.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{detail.product.name}</h3>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Size: {detail.size.name}</p>
                {detail.border && <p>Viền: {detail.border.name}</p>}
                {detail.topping && <p>Topping: {detail.topping.name}</p>}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Số lượng: {detail.quantity}</span>
                <span className="font-semibold">
                  {formatPrice(Number(detail.totalAmount))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Info */}
      <div className="border-t pt-4 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Ghi chú:</p>
            <p>{order.shipNote || "Không có ghi chú"}</p>
          </div>

          {order.rating && (
            <div>
              <p className="text-sm text-gray-500">Đánh giá:</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: order.rating.stars }).map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-yellow-400" />
                ))}
              </div>
              {order.rating.description && (
                <p className="text-sm mt-1">{order.rating.description}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span>Tạm tính:</span>
          <span>{formatPrice(tempPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Phí giao hàng:</span>
          <span>{formatPrice(Number(order.shippingFee))}</span>
        </div>
        <div className="space-y-2">
          {order.coupon && (
            <>
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá ({order.coupon.code}):</span>
                <span>
                  -
                  {formatPrice(
                    tempPrice * (Number(order.coupon.discount) / 100),
                  )}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between pt-2 font-semibold">
            <span>Tổng cộng:</span>
            <span>{formatPrice(Number(order.totalAmount))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
