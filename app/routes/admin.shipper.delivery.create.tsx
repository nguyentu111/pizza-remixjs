import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { createDeliveryRoute } from "~/models/shipping.server";
import { requireStaffId } from "~/session.server";
import { DeliveryRouteForm } from "~/components/shipper/delivery-route-form";
import { safeAction } from "~/lib/utils";

const createRouteSchema = z.object({
  "orderIds[]": z.array(z.string()),
});

export const action = safeAction([
  {
    method: "POST",
    schema: createRouteSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof createRouteSchema>;
      const staffId = await requireStaffId(request);

      const route = await createDeliveryRoute({
        shipperId: staffId,
        orderIds: validatedData["orderIds[]"],
      });

      return json({ success: true, routeId: route.id });
    },
  },
]);

export default function CreateDeliveryRoutePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tạo chuyến giao hàng</h1>
      <DeliveryRouteForm />
    </div>
  );
}
