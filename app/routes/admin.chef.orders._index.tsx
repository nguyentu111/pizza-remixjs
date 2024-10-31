import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { OrderTable } from "~/components/chef/order-table";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ViewOrders]);

  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDING", "COOKING", "COOKED"],
      },
    },
    include: {
      OrderDetail: {
        include: {
          product: true,
          size: true,
          border: true,
          topping: true,
        },
      },
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ orders });
};

export default function ChefOrdersPage() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
      <OrderTable orders={orders} />
    </div>
  );
}
