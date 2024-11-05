import { Form, Link, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useForm } from "~/hooks/use-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatPrice } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { getDeliveryInfo } from "~/models/delivery.server";
import axios from "axios";
import { useToast } from "~/hooks/use-toast";

export function DeliveryRouteDetail({
  route,
}: {
  route: NonNullable<Awaited<ReturnType<typeof getDeliveryInfo>>>;
}) {
  const navigate = useNavigate();
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [cancelNote, setCancelNote] = useState("");
  const { toast } = useToast();
  const fetcher = useFetcher();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">
              Chuyến giao hàng #{route.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {route.DeliveryOrder.length} điểm giao hàng
            </p>
            <Link
              to={`/admin/ship/delivery/${route.id}/route`}
              className="mb-2 text-sm underline text-blue-500"
            >
              Xem lộ trình
            </Link>
          </div>
          <Badge>
            {route.status === "SHIPPING"
              ? "Đang giao"
              : route.status === "COMPLETED"
                ? "Đã hoàn thành"
                : "Đã hủy"}
          </Badge>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {/* <p>Tổng quãng đường: {(route.distance / 1000).toFixed(1)}km</p>
          <p>Thời gian dự kiến: {Math.round(route.duration / 60)} phút</p> */}
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold">Lộ trình giao hàng</h3>

        {route.DeliveryOrder.map((step, index) => (
          <Card
            key={step.orderId}
            className={`p-4 "ring-2 ring-primary" : ""}`}
          >
            <div className="flex justify-between">
              <div>
                <Badge variant="outline">Điểm {index + 1}</Badge>
                <p className="mt-2">Địa chỉ : {step.order.address}</p>
                <p className="">
                  Trạng thái thanh toán :{" "}
                  {step.order.paymentStatus === "PAID"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </p>

                <p className="text-sm text-gray-500">
                  Mã đơn hàng #{step.orderId.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  Ghi chú giao hàng:{" "}
                  {step.order.shipNote
                    ? step.order.shipNote
                    : "Không có ghi chú"}
                </p>
              </div>

              <div>
                <Badge>
                  {step.status === "PENDING"
                    ? "Chờ giao"
                    : step.status === "COMPLETED"
                      ? "Đã giao"
                      : step.status === "SHIPPING"
                        ? "Đang giao"
                        : "Đã hủy"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Form method="PUT">
                <input type="hidden" name="deliveryOrderId" value={step.id} />
                {step.status === "PENDING" && (
                  <>
                    <Button name="action" value="SHIPPING" className="mr-2">
                      Đang giao hàng
                    </Button>
                  </>
                )}
                {(step.status === "SHIPPING" || step.status === "PENDING") && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mr-2" variant={"outline"}>
                        Hủy giao hàng
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Lý do hủy giao hàng</DialogTitle>
                      </DialogHeader>
                      <Form method="PUT">
                        <input
                          type="hidden"
                          name="deliveryOrderId"
                          value={step.id}
                        />

                        <div className="space-y-4">
                          <div>
                            <Label>Ghi chú</Label>
                            <Textarea
                              name="cancelNote"
                              value={cancelNote}
                              onChange={(e) => setCancelNote(e.target.value)}
                              placeholder="Nhập lý do hủy..."
                            />
                          </div>
                          <Button type="submit" name="action" value="CANCEL">
                            Hủy giao hàng
                          </Button>
                        </div>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
                {step.status === "SHIPPING" && (
                  <Button name="action" value="COMPLETED" className="mr-2">
                    Đã giao hàng
                  </Button>
                )}
              </Form>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    </div>
  );
}
