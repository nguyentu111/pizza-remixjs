import { json, redirect } from "@remix-run/node";
import { z } from "zod";
import { safeAction } from "~/lib/utils";
import { createDeliveryRoute } from "~/models/shipping.server";
import { requireStaffId } from "~/session.server";
const schema = z.object({
  "orderIds[]": z.array(z.string()),
});
export const action = safeAction([
  {
    method: "POST",
    schema,
    action: async ({ request }, validatedData) => {
      const staffId = await requireStaffId(request);

      const route = await createDeliveryRoute({
        shipperId: staffId,
        orderIds: validatedData["orderIds[]"],
      });

      return redirect(`/admin/ship/delivery/${route.id}`);
    },
  },
]);
