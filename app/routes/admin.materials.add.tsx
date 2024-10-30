import { Prisma } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateMaterialForm } from "~/components/admin/add-or-update-material-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertMaterialSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { createMaterial, getMaterialByName } from "~/models/material.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const action = safeAction([
  {
    method: "POST",
    schema: insertMaterialSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertMaterialSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateMaterials,
      ]);
      const existingMaterial = await getMaterialByName(validatedData.name);
      if (existingMaterial)
        return json(
          { error: "Tên nguyên liệu đã tồn tại.", success: false },
          { status: 403 },
        );

      await createMaterial({
        name: validatedData.name,
        unit: validatedData.unit,
        warningLimits: new Prisma.Decimal(validatedData.warningLimits),
        image: validatedData.image ?? null,
      });
      return json({
        success: true,
      });
    },
  },
]);

export default function AddMaterialPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm nguyên liệu</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/materials" className="hover:underline">
              Quản lý nguyên liệu
            </a>{" "}
            &gt; Thêm nguyên liệu
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateMaterialForm />
      </div>
    </div>
  );
}
