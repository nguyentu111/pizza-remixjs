import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import {
  completeDeliveryStep,
  cancelDeliveryStep,
} from "~/models/shipping.server";
import { requireStaffId } from "~/session.server";
import { DeliveryRouteDetail } from "~/components/shipper/delivery-route-detail";
import { safeAction } from "~/lib/utils";
import { prisma } from "~/lib/db.server";

const updateStepSchema = z.object({
  orderId: z.string(),
  action: z.enum(["complete", "cancel"]),
  cancelNote: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export const action = safeAction([
  {
    method: "PUT",
    schema: updateStepSchema,
    action: async ({ params, request }, data) => {
      const staffId = await requireStaffId(request);

      if (data.action === "complete") {
        await completeDeliveryStep(params.routeId!, data.orderId, {
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } else {
        await cancelDeliveryStep(
          params.routeId!,
          data.orderId,
          data.cancelNote!,
          {
            latitude: data.latitude,
            longitude: data.longitude,
          },
        );
      }

      return json({ success: true });
    },
  },
]);

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const route = await prisma.deliveryRoute.findUnique({
    where: { id: params.routeId },
    include: {
      orders: true,
      routeSteps: {
        orderBy: { stepNumber: "asc" },
      },
    },
  });

  if (!route) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ route });
};

export default function DeliveryRouteDetailPage() {
  const { route } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chi tiết chuyến giao hàng</h1>
      <DeliveryRouteDetail route={route} />
    </div>
  );
}
