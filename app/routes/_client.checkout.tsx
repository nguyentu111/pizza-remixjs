import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useCart } from "~/components/providers/cart-provider";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { prisma } from "~/lib/db.server";
import {
  cn,
  formatPrice,
  safeAction,
  formatDuration,
  calculateShippingFee,
} from "~/lib/utils";
import { createOrder, updateOrderPaymentStatus } from "~/models/order.server";
import { requireCustomer } from "~/session.server";
import { useForm } from "~/hooks/use-form";
import { FormField } from "~/components/shared/form/form-field";
import { TextareaField } from "~/components/shared/form/form-fields/text-area-field";
import { InputField } from "~/components/shared/form/form-fields/input-field";
import { RadioField } from "~/components/shared/form/form-fields/radio-field";
import { checkoutSchema } from "~/lib/schema";
import { getProductById } from "~/models/product.server";
import { CustomHttpError, ERROR_NAME } from "~/lib/error";
import {
  getProductSizePrice,
  getBorderPrice,
  getToppingPrice,
} from "~/models/product.server";
import { calculateRoute } from "~/use-cases/shipping.server";
import { GraphhopperRouteCalculation } from "~/lib/type";
import { Coupon, Prisma } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
        const route = await calculateRoute(
          Number(validatedData.lat),
          Number(validatedData.lng),
        );
        const shippingFee = calculateShippingFee(route.paths[0].distance);
        // Add shipping fee to final total
        const finalTotal = discountedSubtotal + shippingFee;
        // Tạo order
        const order = await createOrder(tx, {
          address: validatedData.address,
          address_lat: Number(validatedData.lat),
          address_lng: Number(validatedData.lng),
          shipNote: validatedData.shipNote,
          totalAmount: finalTotal,
          shippingFee: shippingFee,
          customerId: customer.id,
          couponId,
          paymentStatus:
            validatedData.paymentMethod === "COD" ? "PENDING" : "WAITING",
          orderDetails,
        });

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
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
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
  console.log({ discountedTotal });
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Size: {item.options.sizeName}</p>
                    {item.options.borderName && (
                      <p>Viền: {item.options.borderName}</p>
                    )}
                    {item.options.toppingName && (
                      <p>Topping: {item.options.toppingName}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span>Số lượng: {item.quantity}</span>
                    <span className="font-semibold">
                      {formatPrice(calculateItemPrice(item))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
          <form.fetcher.Form method="POST" className="space-y-4">
            {/* Hidden inputs for cart items */}
            {items.map((item, index) => (
              <div key={index} className="hidden">
                <input
                  type="hidden"
                  name={`cartItems[${index}].productId`}
                  value={item.id}
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
                    label: "Thanh toán khi nhận hàng (COD)",
                    value: "COD",
                    defaultChecked: true,
                  },
                  {
                    label: "Thanh toán qua MoMo",
                    value: "MOMO",
                  },
                  {
                    label: "Thanh toán qua ngân hàng",
                    value: "BANK",
                  },
                ]}
              />
            </FormField>

            <div className="space-y-4">
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
            </div>

            <input
              type="hidden"
              name="couponCode"
              value={appliedCoupon?.code || ""}
            />

            <input type="hidden" name="shippingFee" value={shippingFee} />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={form.isSubmitting}
            >
              {form.isSubmitting ? "Đang xử lý..." : "Thanh toán"}
            </Button>
          </form.fetcher.Form>
        </div>
      </div>
    </div>
  );
}
