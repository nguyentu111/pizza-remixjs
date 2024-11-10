import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  json,
} from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { safeAction } from "~/lib/utils";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { getImportById, updateImportReceived } from "~/models/import.server";
import { ReceiveImportForm } from "~/components/admin/receive-import-form";
import { Import, ImportMaterial, Material } from "@prisma/client";
import { receiveImportSchema } from "~/lib/schema";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ReceiveImports]);

  const importId = params.importId;
  if (!importId) {
    throw new Response("Not Found", { status: 404 });
  }

  const import_ = await getImportById(importId);
  if (!import_) {
    throw new Response("Not Found", { status: 404 });
  }

  // Check if import is in a receivable state
  if (import_.status !== "APPROVED") {
    throw new Response("Chỉ có thể nhận hàng cho phiếu nhập đã được duyệt", {
      status: 403,
    });
  }

  return json({ import_ });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: receiveImportSchema,
    action: async ({ request, params }, data) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.ReceiveImports,
      ]);

      const importId = params.importId;
      if (!importId) {
        return json(
          { error: "Import ID is required", success: false },
          { status: 400 },
        );
      }

      await updateImportReceived(importId, {
        receivedById: currentUserId,
        materials: data.materials,
      });

      return json({ success: true });
    },
  },
]);

export default function ReceiveImportPage() {
  const { import_ } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Nhận hàng</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/imports" className="hover:underline">
              Quản lý phiếu nhập
            </a>{" "}
            &gt; Nhận hàng
          </nav>
        </div>
      </div>
      <div className="py-10">
        <ReceiveImportForm
          import_={
            import_ as unknown as Import & {
              ImportMaterials: Array<
                ImportMaterial & {
                  Material: Material;
                }
              >;
            }
          }
        />
      </div>
    </>
  );
}
