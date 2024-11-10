import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/lib/db.server";
import { PermissionsEnum } from "~/lib/type";
import { safeAction } from "~/lib/utils";
import { requireStaff } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

const deleteInventorySchema = z.object({
  materialId: z.string(),
  expiredDate: z.string(),
});
export const action = safeAction([
  {
    method: "DELETE",
    schema: deleteInventorySchema,
    action: async ({ request }, validatedData) => {
      const { materialId, expiredDate } = validatedData as z.infer<
        typeof deleteInventorySchema
      >;
      const staff = await requireStaff(prisma, request);
      await requirePermissions(prisma, staff.id, [
        PermissionsEnum.ManageInventory,
      ]);
      const inventory = await prisma.inventory.findFirst({
        where: {
          materialId,
          expiredDate,
        },
      });
      if (!inventory) {
        return json(
          { error: "Inventory not found", success: false },
          { status: 404 },
        );
      }
      await prisma.inventory.delete({
        where: { id: inventory.id },
      });
      return json({ success: true });
    },
  },
]);
