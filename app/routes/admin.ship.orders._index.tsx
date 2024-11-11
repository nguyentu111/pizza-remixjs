import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAvailableOrders } from "~/models/shipping.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { OrderWithDetailsCustomerCoupon } from "~/lib/type";
import { ShipmentOrderTable } from "~/components/shipper/shipment-order-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ViewOrders]);

  const orders = await getAvailableOrders();
  return json({ orders });
};
export { ErrorBoundary };
export default function ShipperOrdersPage() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng cần giao</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Đơn hàng cần giao
          </nav>
        </div>
      </div>
      <ShipmentOrderTable
        orders={orders as unknown as OrderWithDetailsCustomerCoupon[]}
      />
    </>
  );
}
