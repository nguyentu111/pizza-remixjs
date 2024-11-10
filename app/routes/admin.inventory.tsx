import { LoaderFunctionArgs, json } from "@remix-run/node";
import { ShouldRevalidateFunctionArgs, useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { InventoryTable } from "../components/admin/inventory-table";
import { safeAction } from "~/lib/utils";
import { z } from "zod";
import { Material } from "@prisma/client";
import { deleteInventorySchema } from "~/lib/schema";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewInventory]);

  const inventory = await prisma.material.findMany({
    include: {
      Inventory: {
        orderBy: {
          expiredDate: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return json({ inventory });
};
export function shouldRevalidate({
  defaultShouldRevalidate,
  actionResult,
}: ShouldRevalidateFunctionArgs) {
  if (actionResult?.success) {
    return true;
  }

  return false;
}
export const action = safeAction([
  {
    method: "DELETE",
    schema: deleteInventorySchema,
    action: async ({ request }, data) => {
      const user = await requireStaffId(request);
      await requirePermissions(prisma, user, [PermissionsEnum.ManageInventory]);

      await prisma.inventory.delete({
        where: {
          materialId_expiredDate: {
            materialId: data.materialId,
            expiredDate: new Date(data.expiredDate),
          },
        },
      });

      return json({ success: true });
    },
  },
]);

export default function InventoryPage() {
  const { inventory } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kho</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý kho
          </nav>
        </div>
      </div>

      <InventoryTable
        inventory={
          inventory as unknown as (Material & {
            Inventory: Array<{
              quantity: number | string;
              expiredDate: Date;
            }>;
          })[]
        }
      />
    </div>
  );
}
