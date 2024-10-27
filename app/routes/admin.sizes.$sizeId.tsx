import { Size } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateSizeForm } from "~/components/admin/add-or-update-size-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertSizeSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { getSizeById, updateSize, deleteSize } from "~/models/size.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const sizeId = params.sizeId;
  if (!sizeId) {
    throw new Response("Not Found", { status: 404 });
  }
  const size = await getSizeById(sizeId);
  if (!size) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ size });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertSizeSchema.extend({
      image: z.string().optional(),
    }),
    action: async ({ request, params }, data) => {
      const sizeId = params.sizeId;
      if (!sizeId) {
        return json(
          { error: "Size ID is required", success: false },
          { status: 400 },
        );
      }
      const validatedData = data as z.infer<typeof insertSizeSchema> & {
        image?: string;
      };
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateSizes,
      ]);

      await updateSize(sizeId, {
        name: validatedData.name,
        image: validatedData.image,
      });
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const sizeId = params.sizeId;
      if (!sizeId) {
        return json(
          { error: "Size ID is required", success: false },
          { status: 400 },
        );
      }
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteSizes,
      ]);

      await deleteSize(sizeId);
      return json({ success: true });
    },
  },
]);

export default function UpdateSizePage() {
  const { size } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật kích thước</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/sizes" className="hover:underline">
              Quản lý kích thước
            </a>{" "}
            &gt; Cập nhật kích thước
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateSizeForm size={size as unknown as Size} />
      </div>
    </div>
  );
}
