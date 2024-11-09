import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { OrderTable } from "~/components/admin/order-table";
import { getOrders } from "~/models/order.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ViewOrders]);

  const orders = await getOrders();

  return json({ orders });
};

export default function OrdersPage() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý đơn hàng
          </nav>
        </div>
      </div>
      <OrderTable orders={orders as any} />
    </div>
  );
}
