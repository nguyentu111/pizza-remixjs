import { json, LoaderFunctionArgs } from "@remix-run/node";
import { calculateShippingFee } from "~/lib/utils";
import { calculateRoute } from "~/use-cases/shipping.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  const calcPoints = url.searchParams.get("calc_points");

  if (!lat || !lng) {
    return json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const routeData = await calculateRoute(
      Number(lat),
      Number(lng),
      Boolean(calcPoints),
    );

    const shippingFee = calculateShippingFee(routeData.paths[0].distance);

    return json({
      ...routeData,
      shippingFee,
    });
  } catch (error) {
    return json({ error: "Failed to calculate route" }, { status: 500 });
  }
};
