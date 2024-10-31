import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAvailableOrders } from "~/models/shipping.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { ShipperOrderList } from "~/components/shipper/order-list";
import { prisma } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ViewOrders]);

  const orders = await getAvailableOrders();
  return json({ orders });
};

export default function ShipperOrdersPage() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng cần giao</h1>
      <ShipperOrderList orders={orders} />
    </div>
  );
}
