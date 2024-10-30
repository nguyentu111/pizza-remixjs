import { Material, Prisma } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateMaterialForm } from "~/components/admin/add-or-update-material-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertMaterialSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import {
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} from "~/models/material.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const materialId = params.materialId;
  if (!materialId) {
    throw new Response("Not Found", { status: 404 });
  }
  const material = await getMaterialById(materialId);
  if (!material) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ material });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertMaterialSchema,
    action: async ({ request, params }, data) => {
      const materialId = params.materialId;
      if (!materialId) {
        return json(
          { error: "Material ID is required", success: false },
          { status: 400 },
        );
      }
      const validatedData = data as z.infer<typeof insertMaterialSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateMaterials,
      ]);

      await updateMaterial(materialId, {
        name: validatedData.name,
        unit: validatedData.unit,
        warningLimits: new Prisma.Decimal(validatedData.warningLimits),
        image: validatedData.image ?? null,
      });
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const materialId = params.materialId;
      if (!materialId) {
        return json(
          { error: "Material ID is required", success: false },
          { status: 400 },
        );
      }
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteMaterials,
      ]);

      await deleteMaterial(materialId);
      return json({ success: true });
    },
  },
]);

export default function UpdateMaterialPage() {
  const { material } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật nguyên liệu</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/materials" className="hover:underline">
              Quản lý nguyên liệu
            </a>{" "}
            &gt; Cập nhật nguyên liệu
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateMaterialForm material={material as unknown as Material} />
      </div>
    </div>
  );
}
