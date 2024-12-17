import type { Delivery } from "@prisma/client";
import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { DeliveryRouteMap } from "~/components/shipper/delivery-route-map.client";
import { NavigationInstructions } from "~/components/shipper/navigation-instructions.client";
import { OrdersList } from "~/components/shipper/orders-list.client";
import { prisma } from "~/lib/db.server";
import type {
  CalculatedRoute,
  DetailedRoute,
  OptimizedRoute,
} from "~/types/delivery";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css",
  },
];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const routeId = params.routeId;
  if (!routeId) throw new Response("Not Found", { status: 404 });

  const [delivery, settings] = await Promise.all([
    prisma.delivery.findUnique({
      where: { id: routeId },
      include: {
        DeliveryOrder: {
          include: {
            order: {
              include: {
                customer: true,
                OrderDetail: {
                  include: {
                    product: true,
                    size: true,
                    border: true,
                    topping: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.settings.findMany({
      where: {
        name: {
          in: ["storeLat", "storeLng"],
        },
      },
    }),
  ]);

  if (!delivery) throw new Response("Not Found", { status: 404 });

  const storeLocation = {
    lat: Number(settings.find((s) => s.name === "storeLat")?.value || 0),
    lng: Number(settings.find((s) => s.name === "storeLng")?.value || 0),
  };

  return json({ delivery, storeLocation });
};

export default function DeliveryRouteDetailPage() {
  const { delivery, storeLocation } = useLoaderData<typeof loader>();
  const params = useParams();
  const routeId = params.routeId;
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [detailedRoutes, setDetailedRoutes] = useState<DetailedRoute[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const swiperRefs = useRef<{ [key: string]: SwiperType | null }>({});
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const requestLocation = () => {
    setIsLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setCurrentPosition(pos);
        setLocationError(null);

        const orders = delivery.DeliveryOrder.map((deliveryOrder) => ({
          id: deliveryOrder.orderId,
          address: deliveryOrder.order.address,
          address_lat: Number(deliveryOrder.order.address_lat),
          address_lng: Number(deliveryOrder.order.address_lng),
        }));

        const searchParams = new URLSearchParams();
        searchParams.set("orders", JSON.stringify(orders));
        searchParams.set("currentPosition", pos.join(","));

        const response = await fetch(`/api/calculate-route?${searchParams}`);

        const data = (await response.json()) as CalculatedRoute;

        setRoute(data.route);
        setDetailedRoutes(data.detailedRoutes);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting current position:", error);
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền để sử dụng tính năng này.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Không thể xác định vị trí của bạn. Vui lòng kiểm tra kết nối GPS.",
            );
            break;
          case error.TIMEOUT:
            setLocationError(
              "Quá thời gian chờ xác định vị trí. Vui lòng thử lại.",
            );
            break;
          default:
            setLocationError(
              "Đã xảy ra lỗi khi xác định vị trí. Vui lòng thử lại.",
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    requestLocation();
  }, [delivery]);

  const formatDistance = (distanceInMeters: number) => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  };

  const getDirectionIcon = (sign: number) => {
    switch (sign) {
      case -98:
        return "⬆️"; // straight
      case -2:
        return "↖️"; // slight left
      case -3:
        return "⬅️"; // left
      case -1:
        return "↩️"; // sharp left
      case 2:
        return "↗️"; // slight right
      case 3:
        return "➡️"; // right
      case 1:
        return "↪️"; // sharp right
      case 4:
        return "🔄"; // finish
      case 5:
        return "🎯"; // via
      case 6:
        return "🚶"; // roundabout
      default:
        return "➡️";
    }
  };

  if (locationError) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Lộ trình giao hàng</h1>
            <nav className="text-sm text-gray-600">
              <a href="/admin" className="hover:underline">
                Trang chủ
              </a>{" "}
              {" > "}
              <a href="/admin/ship/delivery" className="hover:underline">
                Chuyến giao hàng
              </a>{" "}
              {" > "}
              <a
                href={`/admin/ship/delivery/${routeId}`}
                className="hover:underline"
              >
                Chi tiết chuyến giao hàng #{routeId?.slice(0, 8)}
              </a>{" "}
              {" > "}
              Lộ trình giao hàng
            </nav>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi truy cập vị trí</AlertTitle>
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-lg">Đang tính toán tuyến đường tối ưu...</p>
      </div>
    );
  }

  const currentRoute = detailedRoutes[currentOrderIndex];
  const currentInstruction =
    currentRoute?.instructions[currentInstructionIndex];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Lộ trình giao hàng</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/ship/delivery" className="hover:underline">
              Chuyến giao hàng
            </a>{" "}
            &gt;{" "}
            <a
              href={`/admin/ship/delivery/${routeId}`}
              className="hover:underline"
            >
              Chi tiết chuyến giao hàng #{routeId?.slice(0, 8)}
            </a>{" "}
            &gt; Lộ trình giao hàng
          </nav>
        </div>
      </div>
      <div className="pb-10">
        <div className="h-[80vh]">
          <motion.div
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {route && (
              <DeliveryRouteMap
                route={route}
                currentOrderIndex={currentOrderIndex}
                currentInstruction={currentInstruction || null}
                delivery={
                  delivery as unknown as Delivery & {
                    DeliveryOrder: Array<{
                      order: {
                        address: string;
                        id: string;
                      };
                    }>;
                  }
                }
                routePoints={currentRoute?.points || []}
                currentPosition={currentPosition}
                storeLocation={storeLocation}
              >
                <NavigationInstructions
                  instructions={currentRoute?.instructions}
                  routeIndex={currentOrderIndex}
                  currentInstructionIndex={currentInstructionIndex}
                  swiperRefs={swiperRefs}
                  onInstructionChange={setCurrentInstructionIndex}
                  onMenuClick={(event) => {
                    const button = event.currentTarget;
                    const rect = button.getBoundingClientRect();
                    setMenuPosition({ x: rect.left, y: rect.bottom });
                    setIsOrdersOpen(true);
                  }}
                  formatDistance={formatDistance}
                  getDirectionIcon={getDirectionIcon}
                />
              </DeliveryRouteMap>
            )}
          </motion.div>
          <OrdersList
            isOpen={isOrdersOpen}
            onClose={() => setIsOrdersOpen(false)}
            delivery={delivery}
            currentOrderIndex={currentOrderIndex}
            onOrderSelect={(index) => {
              setCurrentOrderIndex(index);
              setCurrentInstructionIndex(0);
            }}
            buttonPosition={menuPosition}
          />
        </div>
      </div>
    </>
  );
}
