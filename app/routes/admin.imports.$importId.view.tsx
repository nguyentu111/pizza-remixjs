import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { formatDate, formatPrice } from "~/lib/utils";
import { getImportWithApprovalDetails } from "~/models/import.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { Badge } from "~/components/ui/badge";
import { FileText } from "lucide-react";

export { ErrorBoundary };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewImports]);

  const importId = params.importId;
  if (!importId) {
    throw new Response("Not Found", { status: 404 });
  }

  const import_ = await getImportWithApprovalDetails(importId);
  if (!import_) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ import_ });
};

export default function ViewImportPage() {
  const { import_ } = useLoaderData<typeof loader>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
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
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(Number(import_.totalAmount))}
            </p>
          </div>
          {import_.status === "REJECTED" && import_.cancledReason && (
            <div className="col-span-2">
              <h3 className="font-semibold text-red-600">Lý do từ chối</h3>
              <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{import_.cancledReason}</p>
              </div>
            </div>
          )}
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
          {import_.approvedBy && (
            <div>
              <h3 className="font-semibold">Người duyệt</h3>
              <p>{import_.approvedBy.fullname}</p>
            </div>
          )}
          {import_.approvedAt && (
            <div>
              <h3 className="font-semibold">Ngày duyệt</h3>
              <p>{formatDate(import_.approvedAt)}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold">Ngày dự kiến nhận hàng</h3>
            <p>
              {import_.expectedDeliveryDate
                ? formatDate(import_.expectedDeliveryDate)
                : "Chưa xác định"}
            </p>
          </div>
          {import_.quotationLink && (
            <div>
              <h3 className="font-semibold">Bảng báo giá</h3>
              <a
                href={import_.quotationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Xem bảng báo giá
              </a>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-4">Danh sách nguyên liệu</h3>
          <div className="space-y-4">
            {import_.ImportMaterials.map((material) => (
              <div key={material.createdAt} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-lg">
                      {material.Material.name}
                    </h4>
                    <p className="text-gray-600">{material.Material.unit}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-primary">
                      {formatCurrency(Number(material.pricePerUnit || 0))}
                    </div>
                    <p className="text-sm text-gray-500">Đơn giá</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium">Số lượng dự kiến</h4>
                    <p>
                      {material.expectedQuantity} {material.Material.unit}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Thành tiền</h4>
                    <p className="font-semibold">
                      {formatCurrency(
                        Number(material.pricePerUnit || 0) *
                          Number(material.expectedQuantity),
                      )}
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
                  {Number(material.actualGood) > 0 && (
                    <div>
                      <h4 className="font-medium">Số lượng đạt yêu cầu</h4>
                      <p className="text-green-600">
                        {material.actualGood} {material.Material.unit}
                      </p>
                    </div>
                  )}
                  {Number(material.actualDefective) > 0 && (
                    <div>
                      <h4 className="font-medium">Số lượng không đạt</h4>
                      <p className="text-red-600">
                        {material.actualDefective} {material.Material.unit}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-4">Tổng kết</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tổng số lượng nguyên liệu:</span>
              <span>{import_.ImportMaterials.length} loại</span>
            </div>
            <div className="flex justify-between">
              <span>Tổng giá trị đơn hàng:</span>
              <span className="font-semibold text-primary">
                {formatCurrency(Number(import_.totalAmount))}
              </span>
            </div>
            {/*  */}
          </div>
        </div>
      </div>
    </>
  );
}
