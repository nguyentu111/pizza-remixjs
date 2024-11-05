import { json } from "@remix-run/node";

import { LoaderFunctionArgs } from "@remix-run/node";

import { calculateRoute } from "~/use-cases/shipping.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const lat = 10.8482445;
  const lng = 106.7869449;
  const route = await calculateRoute(lat, lng);
  return json(route);
};
