import { useNavigate } from "@remix-run/react";
import { useState } from "react";
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

export function DeliveryRouteDetail({ route }: { route: any }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [cancelNote, setCancelNote] = useState("");
  const { fetcher } = useForm();

  const handleUpdateStep = (action: "complete" | "cancel") => {
    if (!route.routeSteps[currentStep]) return;

    // Get current location
    navigator.geolocation.getCurrentPosition((position) => {
      fetcher.submit(
        {
          orderId: route.routeSteps[currentStep].orderId,
          action,
          cancelNote: action === "cancel" ? cancelNote : undefined,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        { method: "PUT" },
      );
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">
              Chuyến giao hàng #{route.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {route.routeSteps.length} điểm giao hàng
            </p>
          </div>
          <Badge>
            {route.status === "PENDING" ? "Chưa bắt đầu" : "Đang giao"}
          </Badge>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p>Tổng quãng đường: {(route.distance / 1000).toFixed(1)}km</p>
          <p>Thời gian dự kiến: {Math.round(route.duration / 60)} phút</p>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold">Lộ trình giao hàng</h3>

        {route.routeSteps.map((step: any, index: number) => (
          <Card
            key={step.orderId}
            className={`p-4 ${index === currentStep ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex justify-between">
              <div>
                <Badge variant="outline">Điểm {index + 1}</Badge>
                <p className="mt-2">Đơn hàng #{step.orderId.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">
                  {(step.distance / 1000).toFixed(1)}km -{" "}
                  {Math.round(step.duration / 60)} phút
                </p>
              </div>

              <Badge>
                {step.status === "PENDING"
                  ? "Chưa giao"
                  : step.status === "COMPLETED"
                    ? "Đã giao"
                    : "Đã hủy"}
              </Badge>
            </div>

            {index === currentStep && step.status === "PENDING" && (
              <div className="mt-4 flex gap-2">
                <Button onClick={() => handleUpdateStep("complete")}>
                  Đã giao hàng
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Hủy giao hàng</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Lý do hủy giao hàng</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Ghi chú</Label>
                        <Textarea
                          value={cancelNote}
                          onChange={(e) => setCancelNote(e.target.value)}
                          placeholder="Nhập lý do hủy..."
                        />
                      </div>
                      <Button
                        onClick={() => handleUpdateStep("cancel")}
                        disabled={!cancelNote}
                      >
                        Xác nhận hủy
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
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
