import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateProviderForm } from "~/components/admin/add-or-update-provider-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertProviderSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { createProvider, getProviderByName } from "~/models/provider.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const action = safeAction([
  {
    method: "POST",
    schema: insertProviderSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertProviderSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateProviders,
      ]);
      const existingProvider = await getProviderByName(validatedData.name);
      if (existingProvider)
        return json(
          { error: "Tên nhà cung cấp đã tồn tại.", success: false },
          { status: 403 },
        );

      await createProvider({
        name: validatedData.name,
        address: validatedData.address,
        image: validatedData.image ?? null,
      });
      return json({
        success: true,
      });
    },
  },
]);

export default function AddProviderPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm nhà cung cấp</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/providers" className="hover:underline">
              Quản lý nhà cung cấp
            </a>{" "}
            &gt; Thêm nhà cung cấp
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateProviderForm />
      </div>
    </div>
  );
}
