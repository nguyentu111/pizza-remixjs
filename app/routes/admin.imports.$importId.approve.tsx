import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { safeAction } from "~/lib/utils";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useForm } from "~/hooks/use-form";
import { FormField } from "~/components/shared/form/form-field";
import { TextareaField } from "~/components/shared/form/form-fields/text-area-field";
import { ErrorMessage } from "~/components/shared/form/error-message";
import { FileText } from "lucide-react";
import {
  getImportWithApprovalDetails,
  getMaterialPriceHistory,
  approveImport,
} from "~/models/import.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ApproveImports]);

  const importId = params.importId;
  if (!importId) {
    throw new Response("Not Found", { status: 404 });
  }

  const currentImport = await getImportWithApprovalDetails(importId);
  if (!currentImport) {
    throw new Response("Not Found", { status: 404 });
  }

  const priceHistory = await Promise.all(
    currentImport.ImportMaterials.map(async (material) => {
      const history = await getMaterialPriceHistory(
        material.materialId,
        currentImport.createdAt,
      );
      return {
        materialId: material.materialId,
        history,
      };
    }),
  );

  return json({ currentImport, priceHistory });
};

const approveImportSchema = z
  .object({
    action: z.enum(["APPROVE", "REJECT"]),
    reason: z
      .string()
      .optional()
      .transform((val) => val || undefined),
  })
  .superRefine((data, ctx) => {
    if (data.action === "REJECT" && !data.reason) {
      ctx.addIssue({
        code: "custom",
        message: "Vui lòng nhập lý do từ chối",
        path: ["reason"],
      });
    }
  });

export const action = safeAction([
  {
    method: "POST",
    schema: approveImportSchema,
    action: async ({ request, params }, data) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.ApproveImports,
      ]);

      const importId = params.importId;
      if (!importId) {
        return json(
          { error: "Import ID is required", success: false },
          { status: 400 },
        );
      }

      await approveImport(importId, {
        status: data.action === "APPROVE" ? "APPROVED" : "REJECTED",
        approvedById: currentUserId,
        cancledReason: data.action === "REJECT" ? data.reason : undefined,
      });
      return json({ success: true });
    },
  },
]);

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "PENDING":
      return "outline";
    case "APPROVED":
      return "default";
    case "COMPLETED":
      return "success";
    case "REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function ApproveImportPage() {
  const { currentImport, priceHistory } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { fetcher, isSubmitting, control } = useForm<
    typeof approveImportSchema
  >({
    onSuccess: () => {
      navigate("/admin/imports");
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculatePriceDifference = (
    currentPrice: number,
    historicalPrice: number,
  ) => {
    const difference =
      ((currentPrice - historicalPrice) / historicalPrice) * 100;
    return difference.toFixed(2);
  };

  return (
    <div className="container mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Duyệt phiếu nhập</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/imports" className="hover:underline">
              Quản lý phiếu nhập
            </a>{" "}
            &gt; Duyệt phiếu nhập
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin phiếu nhập</h2>
          <div className="space-y-4">
            <div>
              <Label>Trạng thái</Label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(currentImport.status)}>
                  {currentImport.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Nhà cung cấp</Label>
              <p className="text-lg">{currentImport.provider.name}</p>
            </div>
            <div>
              <Label>Ngày tạo</Label>
              <p>{format(new Date(currentImport.createdAt), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <Label>Người tạo</Label>
              <p>{currentImport.createdBy?.fullname}</p>
            </div>
            {currentImport.expectedDeliveryDate && (
              <div>
                <Label>Ngày dự kiến nhận hàng</Label>
                <p>
                  {format(
                    new Date(currentImport.expectedDeliveryDate),
                    "dd/MM/yyyy",
                  )}
                </p>
              </div>
            )}
            <div>
              <Label>Tổng tiền</Label>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(Number(currentImport.totalAmount))}
              </p>
            </div>
            {currentImport.quotationLink && (
              <div>
                <Label>Bảng báo giá</Label>
                <a
                  href={currentImport.quotationLink}
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
        </Card>

        {/* Materials List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Danh sách nguyên liệu</h2>
          <div className="space-y-6">
            {currentImport.ImportMaterials.map((material, index) => {
              const materialPriceHistory = priceHistory.find(
                (ph) => ph.materialId === material.materialId,
              );

              return (
                <div
                  key={material.materialId}
                  className="border-b pb-4 last:border-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        {material.Material.name}{" "}
                        <span className="text-sm text-gray-500">
                          ({material.Material.unit})
                        </span>
                      </h3>
                      <p className="text-sm">
                        Số lượng: {material.expectedQuantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(Number(material.pricePerUnit || 0))}
                      </p>
                      <p className="text-sm text-gray-500">Đơn giá</p>
                    </div>
                  </div>

                  {/* Price History Comparison */}
                  {materialPriceHistory?.history.length ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium">Lịch sử giá:</p>
                      {materialPriceHistory.history.map((hist) => {
                        const priceDiff = calculatePriceDifference(
                          Number(material.pricePerUnit || 0),
                          Number(hist.pricePerUnit || 0),
                        );
                        const isHigher = Number(priceDiff) > 0;

                        return (
                          <div
                            key={hist.importId}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {format(
                                new Date(hist.Import.createdAt),
                                "dd/MM/yyyy",
                              )}
                              :
                            </span>
                            <div className="flex items-center gap-2">
                              <span>
                                {formatCurrency(Number(hist.pricePerUnit || 0))}
                              </span>
                              <Badge
                                variant={isHigher ? "destructive" : "success"}
                              >
                                {isHigher ? "+" : ""}
                                {priceDiff}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Alert className="mt-2">
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Chưa có lịch sử giá</AlertTitle>
                      <AlertDescription>
                        Đây là lần đầu nhập nguyên liệu này
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Approval Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quyết định duyệt</h2>
        <fetcher.Form method="POST" className="space-y-4">
          <FormField control={control} name="reason">
            <Label>Lý do từ chối (nếu có)</Label>
            <TextareaField className="mt-1" />
            <ErrorMessage />
          </FormField>

          <div className="flex gap-4">
            <Button
              type="submit"
              name="action"
              value="APPROVE"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Duyệt phiếu nhập"}
            </Button>
            <Button
              type="submit"
              name="action"
              value="REJECT"
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Từ chối"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
          </div>
        </fetcher.Form>
      </Card>
    </div>
  );
}
