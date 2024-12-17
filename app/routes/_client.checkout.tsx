import { Coupon, Prisma } from "@prisma/client";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useCart } from "~/components/providers/cart-provider";
import { FormField } from "~/components/shared/form/form-field";
import { InputField } from "~/components/shared/form/form-fields/input-field";
import { RadioField } from "~/components/shared/form/form-fields/radio-field";
import { TextareaField } from "~/components/shared/form/form-fields/text-area-field";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useForm } from "~/hooks/use-form";
import { prisma } from "~/lib/db.server";
import { CustomHttpError, ERROR_NAME } from "~/lib/error";
import { checkoutSchema } from "~/lib/schema";
import { GraphhopperRouteCalculation } from "~/lib/type";
import {
  calculateShippingFee,
  cn,
  formatDuration,
  formatPrice,
  generateRandomString,
  safeAction,
} from "~/lib/utils";
import { createOrder } from "~/models/order.server";
import {
  getBorderPrice,
  getProductById,
  getProductSizePrice,
  getToppingPrice,
} from "~/models/product.server";
import { requireCustomer } from "~/session.server";
import { calculateRoute } from "~/use-cases/shipping.server";
import { OrderDetailItem } from "~/components/client/order-details";
import { motion, AnimatePresence } from "framer-motion";
import { parse, isWithinInterval, set } from "date-fns";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const [orderStartSetting, orderEndSetting] = await Promise.all([
    prisma.settings.findFirst({ where: { name: "orderStartTime" } }),
    prisma.settings.findFirst({ where: { name: "orderEndTime" } }),
  ]);

  const customer = await requireCustomer(prisma, request);
  return json({ customer });
};

export const action = safeAction([
  {
    method: "POST",
    schema: checkoutSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof checkoutSchema>;
      const customer = await requireCustomer(prisma, request);

      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Get all required settings
        const settings = await tx.settings.findMany({
          where: {
            name: {
              in: [
                "maxDeliveryRadius",
                "storeLat",
                "storeLng",
                "orderStartTime",
                "orderEndTime",
              ],
            },
          },
        });

        // Check if current time is within delivery hours
        const now = new Date();
        const orderStartTime =
          settings.find((s) => s.name === "orderStartTime")?.value || "08:00";
        const orderEndTime =
          settings.find((s) => s.name === "orderEndTime")?.value || "21:00";

        // Parse time settings into full Date objects
        const startTime = parse(orderStartTime, "HH:mm", new Date());
        const endTime = parse(orderEndTime, "HH:mm", new Date());

        // Set the parsed times to today's date for comparison
        const startDateTime = set(now, {
          hours: startTime.getHours(),
          minutes: startTime.getMinutes(),
          seconds: 0,
          milliseconds: 0,
        });

        const endDateTime = set(now, {
          hours: endTime.getHours(),
          minutes: endTime.getMinutes(),
          seconds: 0,
          milliseconds: 0,
        });

        // Handle case where end time is on the next day
        if (endDateTime < startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const isWithinDeliveryHours = isWithinInterval(now, {
          start: startDateTime,
          end: endDateTime,
        });

        if (!isWithinDeliveryHours) {
          throw new Error(
            `Chúng tôi chỉ nhận đơn hàng từ ${orderStartTime} đến ${orderEndTime}`,
          );
        }

        const storeLocation = {
          lat: Number(settings.find((s) => s.name === "storeLat")?.value) || 0,
          lng: Number(settings.find((s) => s.name === "storeLng")?.value) || 0,
        };

        // Validate coupon if provided
        let couponId: string | undefined;
        let coupon: Coupon | null = null;
        if (validatedData.couponCode) {
          coupon = await tx.coupon.findUnique({
            where: { code: validatedData.couponCode },
          });

          if (
            !coupon ||
            coupon.quantity <= 0 ||
            new Date() < coupon.startDate ||
            new Date() > coupon.endDate
          ) {
            throw new Error("Mã giảm giá không hợp lệ");
          }

          // Update coupon quantity
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { quantity: coupon.quantity - 1 },
          });

          couponId = coupon.id;
        }

        // Tính toán chi tiết cho từng order detail
        const orderDetails = await Promise.all(
          validatedData.cartItems.map(async (item) => {
            const product = await getProductById(tx, item.productId);
            if (!product) {
              throw new CustomHttpError({
                message: "Product not found",
                statusCode: 404,
                name: ERROR_NAME.NOT_FOUND,
              });
            }

            // Lấy giá của size
            const sizePrice = await getProductSizePrice(
              tx,
              item.productId,
              item.sizeId,
            );

            // Lấy giá của border nếu có
            const borderPrice = item.borderId
              ? await getBorderPrice(tx, item.borderId)
              : 0;

            // Lấy giá của topping nếu có
            const toppingPrice = item.toppingId
              ? await getToppingPrice(tx, item.toppingId)
              : 0;

            // Tính tổng giá cho 1 item
            const itemPrice = sizePrice + borderPrice + toppingPrice;
            const totalAmount = itemPrice * Number(item.quantity);

            return {
              productId: item.productId,
              sizeId: item.sizeId,
              borderId: item.borderId,
              toppingId: item.toppingId,
              quantity: Number(item.quantity),
              totalAmount,
            };
          }),
        );

        const subtotal = orderDetails.reduce(
          (sum, item) => sum + Number(item.totalAmount),
          0,
        );
        const discountedSubtotal = coupon
          ? subtotal * (1 - Number(coupon.discount) / 100)
          : subtotal;
        // Apply discount if coupon exists

        const maxRadius = Number(
          settings.find((s) => s.name === "maxDeliveryRadius")?.value || 0,
        );

        // Calculate distance from store to delivery address
        const route = await calculateRoute(
          Number(validatedData.lat),
          Number(validatedData.lng),
          storeLocation.lat,
          storeLocation.lng,
        );

        const distanceInKm = route.paths[0].distance / 1000;

        if (distanceInKm > maxRadius) {
          console.log(
            `Địa chỉ giao hàng nằm ngoài phạm vi cho phép (${maxRadius}km từ cửa hàng)`,
          );
          throw new Error(`Địa chỉ giao hàng nằm ngoài phạm vi cho phép.`);
        }

        const shippingFee = calculateShippingFee(route.paths[0].distance);
        // Add shipping fee to final total
        const finalTotal = discountedSubtotal + shippingFee;

        // Generate payment code for bank transfer
        const paymentCode = generateRandomString(10).toUpperCase();

        // Create order with payment info
        const order = await createOrder(tx, {
          address: validatedData.address,
          address_lat: Number(validatedData.lat),
          address_lng: Number(validatedData.lng),
          shipNote: validatedData.shipNote,
          totalAmount: finalTotal,
          shippingFee: shippingFee,
          customerId: customer.id,
          couponId,
          orderDetails,
          paymentStatus:
            validatedData.paymentMethod === "COD" ? "UNPAID" : "UNPAID",
        });

        // If bank payment, create payment record and redirect to QR page
        if (validatedData.paymentMethod === "BANK") {
          await tx.payment.create({
            data: {
              code: paymentCode,
              order_id: order.id,
              status: "UNPAID",
            },
          });
          const vietQRUrl = `https://api.vietqr.io/image/${process.env.VIETQR_BANK_ID}-${process.env.VIETQR_BANK_ACCOUNT}-${process.env.VIETQR_TEMPLATE_QR}.jpg?addInfo=${paymentCode}&accountName=${process.env.VIETQR_BANK_NAME}&amount=${finalTotal}`;
          console.log("create vietQRUrl", vietQRUrl);

          return redirect(
            `/payment/bank?qr=${encodeURIComponent(vietQRUrl)}&orderId=${order.id}`,
          );
        }

        return redirect("/account/order-history");
      });
    },
  },
]);
type SearchResult = {
  hits: {
    point: {
      lat: number;
      lng: number;
    };
    extent: [number, number, number, number];
    name: string;
    country: string;
    countrycode: string;
    osm_id: number;
    osm_type: string;
    osm_key: string;
    osm_value: string;
  }[];
};
type RouteResult = GraphhopperRouteCalculation | { error: string };
export default function CheckoutPage() {
  const { items, calculateItemPrice, calculateTotal, clearCart } = useCart();
  const { customer } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [isSelectingAddress, setIsSelectingAddress] = useState(false);
  const addressFetcher = useFetcher<SearchResult>();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const form = useForm<typeof checkoutSchema>({
    onSuccess: () => {
      clearCart();
    },
  });
  const routeFetcher = useFetcher<RouteResult>();
  const [couponCode, setCouponCode] = useState("");
  const couponFetcher = useFetcher<{
    coupon?: { code: string; discount: number };
    error?: string;
  }>();
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [shippingFee, setShippingFee] = useState(0);

  const originalTotal = calculateTotal();
  const discountedTotal = appliedCoupon
    ? originalTotal * (1 - Number(appliedCoupon.discount) / 100)
    : originalTotal;
  const finalTotal = discountedTotal + shippingFee;
  // Function to fetch estimated time
  const fetchEstimatedTime = async (lat: number, lng: number) => {
    routeFetcher.load(`/api/ship/route?lat=${lat}&lng=${lng}`);
  };

  // Update click handler for address selection
  const handleAddressSelect = (result: SearchResult["hits"][0]) => {
    setIsSelectingAddress(true);
    setAddress(result.name);
    setSelectedLocation({
      lat: result.point.lat,
      lng: result.point.lng,
    });
    setOpen(false);
    fetchEstimatedTime(result.point.lat, result.point.lng);
  };

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle address search with debounce
  useEffect(() => {
    if (address.trim().length > 0 && !isSelectingAddress) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        console.log("fetching address");
        addressFetcher.load(
          `/api/ship/search?q=${encodeURIComponent(address)}`,
        );
        setOpen(true);
      }, 500);
    } else {
      setIsSelectingAddress(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [address]);

  const searchResults = addressFetcher.data?.hits || [];
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
        <p>Vui lòng thêm sản phẩm vào giỏ hàng để tiếp tục.</p>
      </div>
    );
  }
  useEffect(() => {
    if (couponFetcher.data && !couponFetcher.data.error) {
      setAppliedCoupon({
        code: couponFetcher.data.coupon?.code || "",
        discount: couponFetcher.data.coupon?.discount || 0,
      });
    }
  }, [couponFetcher.data]);

  // Add effect to update shipping fee when route data changes
  useEffect(() => {
    //@ts-ignore
    if (routeFetcher.data && !routeFetcher.data.error) {
      //@ts-ignore
      setShippingFee(calculateShippingFee(routeFetcher.data.paths[0].distance));
    }
  }, [routeFetcher.data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-16"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold mb-6"
      >
        Thanh toán
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
          <AnimatePresence>
            <motion.div layout className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderDetailItem
                    detail={{
                      product: {
                        name: item.product.name,
                        image: item.product.image,
                      },
                      size: {
                        name:
                          item.product.Sizes.find(
                            (s) => s.size.id === item.options.sizeId,
                          )?.size.name ?? "",
                      },
                      border: item.options.borderId
                        ? {
                            name:
                              item.product.Borders?.find(
                                (b) => b.border.id === item.options.borderId,
                              )?.border.name ?? "",
                          }
                        : null,
                      topping: item.options.toppingId
                        ? {
                            name:
                              item.product.Toppings?.find(
                                (t) => t.topping.id === item.options.toppingId,
                              )?.topping.name ?? "",
                          }
                        : null,
                      quantity: item.quantity,
                      totalAmount: calculateItemPrice(item),
                    }}
                    showAllDetails={
                      item.product.Sizes.length > 1 &&
                      item.options.sizeId !== ""
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <motion.div
            layout
            className="border-t pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Delivery Information */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
          <form.fetcher.Form method="POST" className="space-y-4">
            {/* Hidden inputs for cart items */}
            {items.map((item, index) => (
              <div key={index} className="hidden">
                <input
                  type="hidden"
                  name={`cartItems[${index}].productId`}
                  value={item.product.id}
                />
                <input
                  type="hidden"
                  name={`cartItems[${index}].sizeId`}
                  value={item.options.sizeId || ""}
                />
                {item.options.borderId && (
                  <input
                    type="hidden"
                    name={`cartItems[${index}].borderId`}
                    value={item.options.borderId}
                  />
                )}
                {item.options.toppingId && (
                  <input
                    type="hidden"
                    name={`cartItems[${index}].toppingId`}
                    value={item.options.toppingId}
                  />
                )}
                <input
                  type="hidden"
                  name={`cartItems[${index}].quantity`}
                  value={item.quantity}
                />
                <input
                  type="hidden"
                  name={`cartItems[${index}].totalAmount`}
                  value={calculateItemPrice(item)}
                />
              </div>
            ))}

            <input
              type="hidden"
              name="lat"
              value={selectedLocation?.lat || ""}
            />
            <input
              type="hidden"
              name="lng"
              value={selectedLocation?.lng || ""}
            />
            <input type="hidden" name="totalAmount" value={calculateTotal()} />

            <FormField control={form.control} name="phone">
              <Label>Số điện thoại</Label>
              <InputField value={customer.phoneNumbers} disabled />
            </FormField>

            <FormField control={form.control} name="address">
              <Label>Địa chỉ giao hàng</Label>
              <div className="relative">
                <TextareaField
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng"
                  onFocus={() => address.trim().length > 0 && setOpen(true)}
                  required
                />
                {addressFetcher.state === "loading" && (
                  <div className="absolute right-2 top-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                  </div>
                )}
                <div
                  ref={popoverRef}
                  className={cn(
                    "absolute w-full z-10 top-[calc(100%+4px)] bg-white rounded-md border shadow-md",
                    !open && "hidden",
                  )}
                >
                  {searchResults.length > 0 ? (
                    <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.osm_id}
                          type="button"
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100"
                          onClick={() => handleAddressSelect(result)}
                        >
                          {result.name}
                        </button>
                      ))}
                    </div>
                  ) : address.trim().length > 0 &&
                    addressFetcher.state !== "loading" ? (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Không tìm thấy địa chỉ
                    </div>
                  ) : null}
                </div>
                {/* @ts-ignore */}
                {routeFetcher.data && !routeFetcher.data.error && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">
                      Thời gian giao hàng dự kiến:
                    </span>{" "}
                    {/* @ts-ignore */}
                    {formatDuration(routeFetcher.data.paths[0].time)}
                  </div>
                )}
              </div>
              {form.fieldErrors?.find(
                (a) => a.path.includes("lat") || a.path.includes("lat"),
              )?.message && (
                <p className="text-xs text-rose-500">
                  {
                    form.fieldErrors?.find(
                      (a) => a.path.includes("lat") || a.path.includes("lat"),
                    )?.message
                  }
                </p>
              )}
            </FormField>

            <FormField control={form.control} name="shipNote">
              <Label>Ghi chú</Label>
              <TextareaField placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)" />
            </FormField>

            <FormField control={form.control} name="paymentMethod">
              <Label>Phương thức thanh toán</Label>
              <RadioField
                radios={[
                  {
                    label: "Thanh toán qua ngân hàng",
                    value: "BANK",
                    defaultChecked: true,
                  },
                  {
                    label: "Thanh toán khi nhận hàng (COD)",
                    value: "COD",
                  },
                ]}
              />
            </FormField>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <FormField control={form.control} name="couponCode">
                  <InputField
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                </FormField>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (couponCode) {
                      couponFetcher.load(
                        `/api/coupon/check?code=${couponCode}`,
                      );
                    }
                  }}
                  disabled={couponFetcher.state === "loading"}
                >
                  Áp dụng
                </Button>
              </div>

              {couponFetcher.data?.error && (
                <p className="text-sm text-red-500">
                  {couponFetcher.data.error}
                </p>
              )}

              {appliedCoupon && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(originalTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({appliedCoupon.code}):</span>
                    <span>-{formatPrice(originalTotal - discountedTotal)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>Phí giao hàng:</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>

              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </motion.div>

            <input
              type="hidden"
              name="couponCode"
              value={appliedCoupon?.code || ""}
            />

            <input type="hidden" name="shippingFee" value={shippingFee} />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={form.isSubmitting}
              >
                {form.isSubmitting ? "Đang xử lý..." : "Thanh toán"}
              </Button>
            </motion.div>
          </form.fetcher.Form>
        </motion.div>
      </div>
    </motion.div>
  );
}
