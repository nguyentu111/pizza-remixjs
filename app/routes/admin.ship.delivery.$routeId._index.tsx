import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import {
  completeDeliveryOrder,
  cancelDeliveryOrder,
  startDeliveryOrder,
} from "~/models/shipping.server";
import { requireStaffId } from "~/session.server";
import { DeliveryRouteDetail } from "~/components/shipper/delivery-route-detail.client";
import { safeAction } from "~/lib/utils";
import { prisma } from "~/lib/db.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";
import { getDeliveryInfo } from "~/models/delivery.server";

const updateStepSchema = z.object({
  action: z.enum(["COMPLETED", "CANCEL", "SHIPPING"]),
  deliveryOrderId: z.string(),
  cancelNote: z.string().optional(),
});

export const action = safeAction([
  {
    method: "PUT",
    schema: updateStepSchema,
    action: async ({ params, request }, data) => {
      const staffId = await requireStaffId(request);

      if (data.action === "COMPLETED") {
        await completeDeliveryOrder(data.deliveryOrderId);
      } else if (data.action === "CANCEL") {
        await cancelDeliveryOrder(data.deliveryOrderId, data.cancelNote);
      } else if (data.action === "SHIPPING") {
        await startDeliveryOrder(data.deliveryOrderId);
      }

      return json({ success: true });
    },
  },
]);

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ViewOrders]);
  const route = await getDeliveryInfo({ routeId: params.routeId! });

  if (!route) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ route });
};
export type DeliveryRouteDetailType = Awaited<ReturnType<typeof loader>>;
export default function DeliveryRouteDetailPage() {
  const { route } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết chuyến giao hàng</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/ship/delivery" className="hover:underline">
              Chuyến giao hàng
            </a>{" "}
            &gt; Chi tiết chuyến giao hàng
          </nav>
        </div>
      </div>
      <div className="py-10">
        <DeliveryRouteDetail route={route as any} />
      </div>
    </>
  );
}
