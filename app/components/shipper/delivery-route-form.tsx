import { useNavigate, useSearchParams } from "@remix-run/react";
import { useForm } from "~/hooks/use-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useToast } from "~/hooks/use-toast";

export function DeliveryRouteForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const orderIds = searchParams.get("orders")?.split(",") || [];

  const { fetcher, isSubmitting } = useForm({
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Đã tạo chuyến giao hàng mới",
      });
      navigate(`/admin/shipper/delivery/${data.routeId}`);
    },
  });

  if (orderIds.length === 0) {
    return (
      <Card className="p-6">
        <p>Vui lòng chọn đơn hàng để tạo chuyến giao</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Quay lại
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        Tạo chuyến giao hàng ({orderIds.length} đơn hàng)
      </h2>

      <fetcher.Form method="post" className="space-y-6">
        {orderIds.map((id) => (
          <input key={id} type="hidden" name="orderIds[]" value={id} />
        ))}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Tạo chuyến giao hàng"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Hủy
          </Button>
        </div>
      </fetcher.Form>
    </Card>
  );
}
