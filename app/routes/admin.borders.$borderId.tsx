import { Border } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateBorderForm } from "~/components/admin/add-or-update-border-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertBorderSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import {
  getBorderById,
  updateBorder,
  deleteBorder,
} from "~/models/border.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const borderId = params.borderId;
  if (!borderId) {
    throw new Response("Not Found", { status: 404 });
  }
  const border = await getBorderById(borderId);
  if (!border) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ border });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertBorderSchema,
    action: async ({ request, params }, data) => {
      const borderId = params.borderId;
      if (!borderId) {
        return json(
          { error: "Border ID is required", success: false },
          { status: 400 },
        );
      }
      const validatedData = data as z.infer<typeof insertBorderSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateBorders,
      ]);

      await updateBorder(borderId, {
        name: validatedData.name,
        price: parseInt(validatedData.price),
        image: validatedData.image ?? undefined,
      });
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const borderId = params.borderId;
      if (!borderId) {
        return json(
          { error: "Border ID is required", success: false },
          { status: 400 },
        );
      }
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteBorders,
      ]);

      await deleteBorder(borderId);
      return json({ success: true });
    },
  },
]);

export default function UpdateBorderPage() {
  const { border } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật viền</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/borders" className="hover:underline">
              Quản lý viền
            </a>{" "}
            &gt; Cập nhật viền
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateBorderForm border={border as unknown as Border} />
      </div>
    </div>
  );
}
