import { Topping, Material } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateToppingForm } from "~/components/admin/add-or-update-topping-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertToppingSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import {
  getToppingById,
  updateTopping,
  deleteTopping,
} from "~/models/topping.server";
import { getAllMaterials } from "~/models/material.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const toppingId = params.toppingId;
  if (!toppingId) {
    throw new Response("Not Found", { status: 404 });
  }
  const topping = await getToppingById(toppingId);
  if (!topping) {
    throw new Response("Not Found", { status: 404 });
  }
  const materials = await getAllMaterials();
  return json({ topping, materials });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertToppingSchema,
    action: async ({ request, params }, data) => {
      const toppingId = params.toppingId;
      if (!toppingId) {
        return json(
          { error: "Topping ID is required", success: false },
          { status: 400 },
        );
      }
      const validatedData = data as z.infer<typeof insertToppingSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateToppings,
      ]);

      await updateTopping(toppingId, {
        name: validatedData.name,
        price: parseFloat(validatedData.price),
        materialId: validatedData.materialId,
        image: validatedData.image ?? undefined,
      });
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const toppingId = params.toppingId;
      if (!toppingId) {
        return json(
          { error: "Topping ID is required", success: false },
          { status: 400 },
        );
      }
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteToppings,
      ]);

      await deleteTopping(toppingId);
      return json({ success: true });
    },
  },
]);

export default function UpdateToppingPage() {
  const { topping, materials } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật topping</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/toppings" className="hover:underline">
              Quản lý topping
            </a>{" "}
            &gt; Cập nhật topping
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateToppingForm
          topping={topping as unknown as Topping}
          materials={materials as unknown as Material[]}
        />
      </div>
    </div>
  );
}
