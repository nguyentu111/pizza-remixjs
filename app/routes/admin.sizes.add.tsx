import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateSizeForm } from "~/components/admin/add-or-update-size-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertSizeSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { createSize, getSizeByName } from "~/models/size.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const action = safeAction([
  {
    method: "POST",
    schema: insertSizeSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertSizeSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateSizes,
      ]);
      const existingSize = await getSizeByName(validatedData.name);
      if (existingSize)
        return json(
          { error: "Tên kích thước đã tồn tại.", success: false },
          { status: 403 },
        );

      await createSize({
        name: validatedData.name,
        image: validatedData.image ?? null,
      });
      return json({
        success: true,
      });
    },
  },
]);

export default function AddSizePage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm kích thước</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/sizes" className="hover:underline">
              Quản lý kích thước
            </a>{" "}
            &gt; Thêm kích thước
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateSizeForm />
      </div>
    </div>
  );
}
