import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/lib/db.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { OrderDetails } from "~/components/chef/order-details";
import { safeAction } from "~/lib/utils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ViewOrders]);

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      OrderDetail: {
        include: {
          product: {
            include: {
              Recipes: {
                include: {
                  material: true,
                },
              },
            },
          },
          size: true,
          border: true,
          topping: true,
        },
      },
      customer: true,
    },
  });

  if (!order) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ order });
};

const updateOrderSchema = z.object({
  status: z.enum(["COOKING", "COOKED"]),
});

export const action = safeAction([
  {
    method: "PUT",
    schema: updateOrderSchema,
    action: async ({ request, params }, data) => {
      const staffId = await requireStaffId(request);
      await requirePermissions(prisma, staffId, [PermissionsEnum.UpdateOrders]);

      await prisma.order.update({
        where: { id: params.orderId },
        data: {
          status: data.status,
          chefId: staffId,
        },
      });

      return json({ success: true });
    },
  },
]);

export default function OrderDetailsPage() {
  const { order } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chi tiết đơn hàng #{order.id}</h1>
      <OrderDetails order={order} />
    </div>
  );
}
