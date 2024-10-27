import { Provider } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateProviderForm } from "~/components/admin/add-or-update-provider-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertProviderSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import {
  deleteProvider,
  getProviderById,
  getProviderByName,
  updateProvider,
} from "~/models/provider.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.UpdateProviders]);
  const provider = await getProviderById(params.providerId!);
  if (!provider) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ provider });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertProviderSchema,
    action: async ({ request, params }, data) => {
      const validatedData = data as z.infer<typeof insertProviderSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateProviders,
      ]);

      const existingProvider = await getProviderByName(validatedData.name);
      if (existingProvider && existingProvider.id !== params.providerId) {
        return json(
          { error: "Tên nhà cung cấp đã tồn tại.", success: false },
          { status: 403 },
        );
      }

      await updateProvider(params.providerId!, {
        name: validatedData.name,
        address: validatedData.address,
        image: validatedData.image ?? null,
      });
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    schema: z.object({}),
    action: async ({ request, params }) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteProviders,
      ]);

      await deleteProvider(params.providerId!);
      return json({ success: true });
    },
  },
]);

export default function UpdateProviderPage() {
  const { provider } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật nhà cung cấp</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/providers" className="hover:underline">
              Quản lý nhà cung cấp
            </a>{" "}
            &gt; Cập nhật nhà cung cấp
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateProviderForm provider={provider as unknown as Provider} />
      </div>
    </div>
  );
}
