import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/lib/db.server";
import { insertImportSchema } from "~/lib/schema";
import { PermissionsEnum } from "~/lib/type";
import { safeAction } from "~/lib/utils";
import { updateImport } from "~/models/import.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

import { deleteImport } from "~/models/import.server";
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewImports]);

  const importId = params.importId;
  if (!importId) {
    throw new Response("Not Found", { status: 404 });
  }
  return null;
};
export const action = safeAction([
  {
    method: "PUT",
    schema: insertImportSchema,
    action: async ({ request, params }, data) => {
      const validatedData = data as z.infer<typeof insertImportSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateImports,
      ]);

      const importId = params.importId;
      if (!importId) {
        return json(
          { error: "Import ID is required", success: false },
          { status: 400 },
        );
      }

      // Check import status before update
      const import_ = await prisma.import.findUnique({
        where: { id: importId },
        select: { status: true },
      });

      if (!import_) {
        return json(
          { error: "Import not found", success: false },
          { status: 404 },
        );
      }

      if (import_.status === "APPROVED" || import_.status === "REJECTED") {
        return json(
          {
            error: "Không thể chỉnh sửa phiếu nhập đã được duyệt hoặc từ chối",
            success: false,
          },
          { status: 403 },
        );
      }

      await updateImport(importId, {
        status: validatedData.quotationLink ? "WAITING_APPROVAL" : "PENDING",
        provider: { connect: { id: validatedData.providerId } },
        expectedDeliveryDate: validatedData.expectedDeliveryDate
          ? new Date(validatedData.expectedDeliveryDate)
          : undefined,
        quotationLink: validatedData.quotationLink,
        materials: validatedData.materials.map((m) => ({
          materialId: m.materialId,
          expectedQuantity: Number(m.expectedQuantity),
          qualityStandard: m.qualityStandard,
          expiredDate: m.expiredDate ? new Date(m.expiredDate) : undefined,
          pricePerUnit: m.pricePerUnit ? Number(m.pricePerUnit) : null,
        })),
      });

      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteImports,
      ]);

      const importId = params.importId;
      if (!importId) {
        return json(
          { error: "Import ID is required", success: false },
          { status: 400 },
        );
      }

      // Check import status before deletion
      const import_ = await prisma.import.findUnique({
        where: { id: importId },
        select: { status: true },
      });

      if (!import_) {
        return json(
          { error: "Import not found", success: false },
          { status: 404 },
        );
      }

      if (import_.status === "APPROVED" || import_.status === "REJECTED") {
        return json(
          {
            error: "Không thể xóa phiếu nhập đã được duyệt hoặc từ chối",
            success: false,
          },
          { status: 403 },
        );
      }

      await deleteImport(importId);

      return json({ success: true });
    },
  },
]);
export default function ImportIdLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
