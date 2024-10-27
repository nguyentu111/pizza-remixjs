import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateBorderForm } from "~/components/admin/add-or-update-border-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertBorderSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { createBorder, getBorderByName } from "~/models/border.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const action = safeAction([
  {
    method: "POST",
    schema: insertBorderSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertBorderSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateBorders,
      ]);
      const existingBorder = await getBorderByName(validatedData.name);
      if (existingBorder)
        return json(
          { error: "Tên viền đã tồn tại.", success: false },
          { status: 403 },
        );

      await createBorder({
        name: validatedData.name,
        price: parseFloat(validatedData.price),
        image: validatedData.image ?? null,
      });
      return json({
        success: true,
      });
    },
  },
]);

export default function AddBorderPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm viền</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/borders" className="hover:underline">
              Quản lý viền
            </a>{" "}
            &gt; Thêm viền
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateBorderForm />
      </div>
    </div>
  );
}
