import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { prisma } from "~/lib/db.server";
import PusherClient from "pusher-js";
import { formatPrice } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle } from "lucide-react";
import { OrderDetailItem } from "~/components/client/order-details";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const qr = url.searchParams.get("qr");
  const orderId = url.searchParams.get("orderId");

  if (!qr || !orderId) {
    return redirect("/", { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      Payment: true,
      OrderDetail: {
        include: {
          product: true,
          size: true,
          border: true,
          topping: true,
        },
      },
      coupon: true,
    },
  });

  if (!order || order.Payment.length === 0) {
    console.log("order or payment not found");
    return redirect("/", { status: 404 });
  }

  return json({
    qr,
    order,
    paymentCode: order.Payment[0].code,
    env: {
      PUSHER_KEY: process.env.PUSHER_KEY,
      PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
    },
  });
}

export default function BankPaymentPage() {
  const { qr, paymentCode, order, env } = useLoaderData<typeof loader>();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const pusherClient = new PusherClient(env.PUSHER_KEY as string, {
      cluster: env.PUSHER_CLUSTER as string,
    });

    const channel = pusherClient.subscribe(`payment-${paymentCode}`);

    channel.bind("payment-completed", (data: { status: string }) => {
      if (data.status === "PAID") {
        setPaymentSuccess(true);

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Redirect after delay
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`payment-${paymentCode}`);
    };
  }, [paymentCode]);

  // Calculate subtotal before shipping and discounts
  const subtotal = order.OrderDetail.reduce(
    (sum, detail) => sum + Number(detail.totalAmount),
    0,
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {paymentSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-white p-8 rounded-lg shadow-xl text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Thanh toán thành công!
                </h2>
                <p className="text-gray-600">
                  Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
                </p>
                <Link to="/account/order-history">Đi đến lịch sử đơn hàng</Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-2xl font-bold mb-6 text-center">
                Thanh toán đơn hàng
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Existing QR Code Section */}
                <motion.div
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <img src={qr} alt="QR Code" className="w-full mb-4" />
                    <div className="text-center">
                      <p className="font-medium mb-2">
                        Mã thanh toán: {paymentCode}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quét mã QR để thanh toán. Sau khi thanh toán thành công,
                        bạn sẽ được chuyển hướng tự động.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Existing Order Details Section */}
                <motion.div
                  initial={{ x: 20 }}
                  animate={{ x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">
                      Chi tiết đơn hàng
                    </h2>

                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.OrderDetail.map((detail) => (
                        <OrderDetailItem
                          key={detail.id}
                          detail={{
                            product: {
                              name: detail.product.name,
                              image: detail.product.image,
                            },
                            size: {
                              name: detail.size.name,
                            },
                            border: detail.border,
                            topping: detail.topping,
                            quantity: detail.quantity,
                            totalAmount: detail.totalAmount,
                          }}
                          showAllDetails={false}
                        />
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Phí giao hàng:</span>
                        <span>{formatPrice(Number(order.shippingFee))}</span>
                      </div>

                      {order.coupon && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Giảm giá ({order.coupon.code}):</span>
                          <span>
                            -
                            {formatPrice(
                              subtotal * (Number(order.coupon.discount) / 100),
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between pt-2 text-lg font-semibold">
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(Number(order.totalAmount))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-2">
                      Địa chỉ giao hàng
                    </h2>
                    <p className="text-gray-600">{order.address}</p>
                    {order.shipNote && (
                      <>
                        <h2 className="text-lg font-semibold mb-2 mt-4">
                          Ghi chú
                        </h2>
                        <p className="text-gray-600">{order.shipNote}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
