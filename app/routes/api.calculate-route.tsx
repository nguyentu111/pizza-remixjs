import { LoaderFunctionArgs, json } from "@remix-run/node";
import { calculateOptimalRoute } from "~/use-cases/shipping.server";
import axios from "axios";
import polyline from "@mapbox/polyline";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const orders = JSON.parse(url.searchParams.get("orders") || "[]");
  const currentPosition = url.searchParams
    .get("currentPosition")
    ?.split(",")
    .map(Number);

  // Calculate optimal route
  const route = await calculateOptimalRoute(orders);

  // Calculate detailed routes between points
  const detailedRoutes = await Promise.all(
    route.steps.map(async (step, index) => {
      if (index === 0 && currentPosition) {
        // Calculate route from current position to first order
        const response = await axios.get(
          `https://graphhopper.com/api/1/route?point=${currentPosition[0]},${currentPosition[1]}&point=${step.latitude},${step.longitude}&vehicle=car&locale=vi&instructions=true&points_encoded=true&key=${process.env.GRAPHHOPPER_API_KEY}`,
        );

        const path = response.data.paths[0];
        const decodedPoints = polyline.decode(path.points);
        const instructions = path.instructions.map((instruction: any) => {
          const startIdx = instruction.interval[0];
          const point = decodedPoints[startIdx];
          return {
            text: instruction.text,
            distance: instruction.distance,
            time: instruction.time,
            sign: instruction.sign,
            latitude: point[0],
            longitude: point[1],
          };
        });

        return {
          points: decodedPoints.map((p: number[]) => ({
            lat: p[0],
            lng: p[1],
          })),
          instructions,
          distance: path.distance,
          time: path.time,
        };
      }

      if (index === 0) {
        return {
          points: [],
          instructions: [],
          distance: 0,
          time: 0,
        };
      }

      const startPoint = {
        lat: route.steps[index - 1].latitude,
        lng: route.steps[index - 1].longitude,
      };
      const endPoint = { lat: step.latitude, lng: step.longitude };

      const response = await axios.get(
        `https://graphhopper.com/api/1/route?point=${startPoint.lat},${startPoint.lng}&point=${endPoint.lat},${endPoint.lng}&vehicle=car&locale=vi&instructions=true&points_encoded=true&key=${process.env.GRAPHHOPPER_API_KEY}`,
      );

      const path = response.data.paths[0];
      const decodedPoints = polyline.decode(path.points);
      const instructions = path.instructions.map((instruction: any) => {
        const startIdx = instruction.interval[0];
        const point = decodedPoints[startIdx];
        return {
          text: instruction.text,
          distance: instruction.distance,
          time: instruction.time,
          sign: instruction.sign,
          latitude: point[0],
          longitude: point[1],
        };
      });

      return {
        points: decodedPoints.map((p: number[]) => ({ lat: p[0], lng: p[1] })),
        instructions,
        distance: path.distance,
        time: path.time,
      };
    }),
  );

  return json({ route, detailedRoutes });
};
