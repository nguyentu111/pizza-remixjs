import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { formatDate, formatPrice } from "~/lib/utils";
import { getImportById } from "~/models/import.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { Badge } from "~/components/ui/badge";

export { ErrorBoundary };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewImports]);

  const importId = params.importId;
  if (!importId) {
    throw new Response("Not Found", { status: 404 });
  }

  const import_ = await getImportById(importId);
  if (!import_) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({
    import_: {
      ...import_,
      totalAmount: import_.totalAmount.toString(),
    },
  });
};

export default function ViewImportPage() {
  const { import_ } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết phiếu nhập</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/imports" className="hover:underline">
              Quản lý phiếu nhập
            </a>{" "}
            &gt; Chi tiết phiếu nhập
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Nhà cung cấp</h3>
            <p>{import_.provider.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Tổng tiền</h3>
            <p>{formatPrice(Number(import_.totalAmount))}</p>
          </div>
          <div>
            <h3 className="font-semibold">Trạng thái</h3>
            <Badge
              variant={
                import_.status === "PENDING"
                  ? "outline"
                  : import_.status === "APPROVED"
                    ? "default"
                    : import_.status === "COMPLETED"
                      ? "success"
                      : "destructive"
              }
            >
              {import_.status}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold">Ngày dự kiến nhận hàng</h3>
            <p>
              {import_.expectedDeliveryDate
                ? formatDate(import_.expectedDeliveryDate)
                : "Chưa xác định"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Danh sách nguyên liệu</h3>
          <div className="space-y-4">
            {import_.ImportMaterials.map((material) => (
              <div key={material.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Tên nguyên liệu</h4>
                    <p>{material.Material.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Số lượng dự kiến</h4>
                    <p>
                      {material.expectedQuantity} {material.Material.unit}
                    </p>
                  </div>
                  {material.qualityStandard && (
                    <div>
                      <h4 className="font-medium">Tiêu chuẩn chất lượng</h4>
                      <p>{material.qualityStandard}</p>
                    </div>
                  )}
                  {material.expiredDate && (
                    <div>
                      <h4 className="font-medium">Hạn sử dụng</h4>
                      <p>{formatDate(material.expiredDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
