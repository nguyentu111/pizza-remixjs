import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDate, formatPrice } from "~/lib/utils";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ViewOrders]);

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      OrderDetail: {
        include: {
          product: true,
          size: true,
          border: true,
          topping: true,
        },
      },
      customer: true,
      chef: true,
      shipper: true,
      DeliveryOrder: true,
      coupon: true,
      rating: true,
    },
  });

  if (!order) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ order });
};

export default function OrderDetailsPage() {
  const { order } = useLoaderData<typeof loader>();

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

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">Đã thanh toán</Badge>;
      case "UNPAID":
        return <Badge variant="destructive">Chưa thanh toán</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/orders" className="hover:underline">
              Quản lý đơn hàng
            </a>{" "}
            &gt; Chi tiết đơn hàng
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thanh toán</p>
                <div>{getPaymentStatusBadge(order.paymentStatus)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tiền</p>
                <p className="font-semibold">
                  {formatPrice(Number(order.totalAmount))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tên khách hàng</p>
              <p className="font-semibold">{order.customer.fullname}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p>{order.customer.phoneNumbers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
              <p>{order.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Staff Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhân viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nhân viên chế biến</p>
              <p className="font-semibold">
                {order.chef?.fullname || "Chưa có"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nhân viên giao hàng</p>
              <p>{order.shipper?.fullname || "Chưa có"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.OrderDetail.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-start justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-semibold">{detail.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {detail.size.name}
                      {detail.border && ` - Viền: ${detail.border.name}`}
                      {detail.topping && ` - Topping: ${detail.topping.name}`}
                    </p>
                    <p className="text-sm">Số lượng: {detail.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(Number(detail.totalAmount))}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Information if exists */}
        {order.rating && (
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <p className="text-sm text-gray-500">Số sao:</p>
                  <p className="ml-2 font-semibold">{order.rating.stars}/5</p>
                </div>
                {order.rating.description && (
                  <div>
                    <p className="text-sm text-gray-500">Nhận xét:</p>
                    <p>{order.rating.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
