import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateToppingForm } from "~/components/admin/add-or-update-topping-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertToppingSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { createTopping, getToppingByName } from "~/models/topping.server";
import { getAllMaterials } from "~/models/material.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { Material, Topping } from "@prisma/client";

export { ErrorBoundary };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireStaffId(request);
  // Uncomment the following line when you're ready to implement permissions
  await requirePermissions(prisma, user, [PermissionsEnum.CreateToppings]);

  const materials = await getAllMaterials();
  return json({ materials });
};

export const action = safeAction([
  {
    method: "POST",
    schema: insertToppingSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertToppingSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateToppings,
      ]);
      const existingTopping = await getToppingByName(validatedData.name);
      if (existingTopping)
        return json(
          { error: "Tên topping đã tồn tại.", success: false },
          { status: 403 },
        );

      await createTopping({
        name: validatedData.name,
        price: parseFloat(validatedData.price),
        materialId: validatedData.materialId,
        image: validatedData.image ?? null,
      });
      return json({
        success: true,
      });
    },
  },
]);

export default function AddToppingPage() {
  const { materials } = useLoaderData<{ materials: Material[] }>();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm topping</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/toppings" className="hover:underline">
              Quản lý topping
            </a>{" "}
            &gt; Thêm topping
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateToppingForm
          materials={materials as unknown as Material[]}
        />
      </div>
    </div>
  );
}
