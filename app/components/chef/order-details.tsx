import { useNavigate } from "@remix-run/react";
import { formatPrice } from "~/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useForm } from "~/hooks/use-form";

export function OrderDetails({ order }: { order: any }) {
  const navigate = useNavigate();
  const { fetcher } = useForm();

  const handleUpdateStatus = (status: "COOKING" | "COOKED") => {
    fetcher.submit({ status }, { method: "PUT" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Chờ xử lý</Badge>;
      case "COOKING":
        return <Badge variant="default">Đang chế biến</Badge>;
      case "COOKED":
        return <Badge variant="success">Đã chế biến xong</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Thông tin đơn hàng */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Khách hàng</h3>
            <p>{order.customer.fullname}</p>
          </div>
          <div>
            <h3 className="font-semibold">Trạng thái</h3>
            {getStatusBadge(order.status)}
          </div>
          <div>
            <h3 className="font-semibold">Tổng tiền</h3>
            <p className="text-lg font-semibold text-primary">
              {formatPrice(Number(order.totalAmount))}
            </p>
          </div>
        </div>
      </Card>

      {/* Chi tiết sản phẩm và công thức */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Chi tiết đơn hàng</h2>
        {order.OrderDetail.map((detail: any) => (
          <Card key={detail.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{detail.product.name}</h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Size: {detail.size.name}</p>
                  {detail.border && <p>Viền: {detail.border.name}</p>}
                  {detail.topping && <p>Topping: {detail.topping.name}</p>}
                  <p>Số lượng: {detail.quantity}</p>
                </div>
              </div>
              <p className="font-semibold">
                {formatPrice(Number(detail.totalAmount))}
              </p>
            </div>

            {/* Công thức */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium mb-2">Công thức:</h4>
              <ul className="list-disc list-inside space-y-1">
                {detail.product.Recipes.map((recipe: any) => (
                  <li key={recipe.materialId}>
                    {recipe.material.name}: {recipe.quantity}{" "}
                    {recipe.material.unit}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* Nút thao tác */}
      <div className="flex gap-4">
        {order.status === "PENDING" && (
          <Button onClick={() => handleUpdateStatus("COOKING")}>
            Bắt đầu chế biến
          </Button>
        )}
        {order.status === "COOKING" && (
          <Button onClick={() => handleUpdateStatus("COOKED")}>
            Hoàn thành chế biến
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    </div>
  );
}
