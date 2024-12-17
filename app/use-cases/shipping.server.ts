import { CustomHttpError, ERROR_NAME } from "~/lib/error";
import { GraphhopperRouteCalculation } from "~/lib/type";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "~/lib/db.server";

type Location = {
  id: string;
  address: string;
  address_lat: Decimal;
  address_lng: Decimal;
};

type RouteStep = {
  orderId: string;
  latitude: number;
  longitude: number;
  distance: number;
  duration: number;
  instruction: string;
};

type OptimalRoute = {
  distance: number;
  duration: number;
  steps: RouteStep[];
};

interface GraphHopperAddress {
  location_id: string;
  lon: number;
  lat: number;
}

interface GraphHopperVehicle {
  vehicle_id: string;
  start_address: GraphHopperAddress;
}

interface GraphHopperService {
  id: string;
  name: string;
  address: GraphHopperAddress;
}

interface GraphHopperActivity {
  type: "start" | "service" | "end";
  id: string;
  address: GraphHopperAddress;
  arr_time: number;
  end_time: number;
  waiting_time: number;
  distance: number;
  driving_time: number;
}

interface GraphHopperRoute {
  vehicle_id: string;
  activities: GraphHopperActivity[];
  transport_time: number;
  completion_time: number;
  waiting_time: number;
  service_duration: number;
  distance: number;
}

interface GraphHopperOptimizationResponse {
  status: string;
  solution: {
    routes: GraphHopperRoute[];
    unassigned: any[];
    total_time: number;
    total_distance: number;
    no_vehicles: number;
  };
}

export async function calculateRoute(
  lat: number,
  lng: number,
  storeLat?: number,
  storeLng?: number,
  calcPoints = false,
) {
  try {
    if (!storeLat || !storeLng) {
      const settings = await prisma.settings.findMany({
        where: {
          name: {
            in: ["storeLat", "storeLng"],
          },
        },
      });

      storeLat = Number(
        settings.find((s) => s.name === "storeLat")?.value || 0,
      );
      storeLng = Number(
        settings.find((s) => s.name === "storeLng")?.value || 0,
      );

      if (!storeLat || !storeLng) {
        throw new Error("Store location not configured");
      }
    }

    const response = await fetch(
      `https://graphhopper.com/api/1/route?point=${storeLat},${storeLng}&point=${lat},${lng}&vehicle=car&locale=vi&calc_points=${calcPoints}&key=${process.env.GRAPHHOPPER_API_KEY}`,
    );

    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to calculate route");
    }

    const data = await response.json();
    return data as GraphhopperRouteCalculation;
  } catch (error) {
    console.error("Route calculation error:", error);
    throw new CustomHttpError({
      message: "Failed to calculate route",
      statusCode: 500,
      name: ERROR_NAME.DEFAULT,
    });
  }
}

export async function calculateOptimalRoute(
  orders: Location[],
): Promise<OptimalRoute> {
  try {
    const settings = await prisma.settings.findMany({
      where: {
        name: {
          in: ["storeLat", "storeLng"],
        },
      },
    });

    const storeLat = Number(
      settings.find((s) => s.name === "storeLat")?.value || 0,
    );
    const storeLng = Number(
      settings.find((s) => s.name === "storeLng")?.value || 0,
    );

    if (!storeLat || !storeLng) {
      throw new Error("Store location not configured");
    }

    const vehicle: GraphHopperVehicle = {
      vehicle_id: "delivery_scooter",
      start_address: {
        location_id: "store",
        lon: storeLng,
        lat: storeLat,
      },
    };

    const services: GraphHopperService[] = orders.map((order) => ({
      id: order.id,
      name: `Vận chuyển đến ${order.address}`,
      address: {
        location_id: order.id,
        lon: Number(order.address_lng),
        lat: Number(order.address_lat),
      },
    }));

    const requestBody = {
      vehicles: [vehicle],
      services: services,
      configuration: {
        routing: {
          calc_points: true,
          return_snapped_waypoints: true,
        },
      },
      objectives: [
        {
          type: "min",
          value: "transport_time",
        },
      ],
      vehicle_types: [
        {
          type_id: "custom_vehicle_type",
          profile: "car",
        },
      ],
    };

    const response = await fetch(
      `https://graphhopper.com/api/1/vrp?key=${process.env.GRAPHHOPPER_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );
    if (!response.ok) {
      throw new Error(`GraphHopper API error: ${response.statusText}`);
    }

    const result = (await response.json()) as GraphHopperOptimizationResponse;

    const solution = result.solution;
    if (!solution || !solution.routes || !solution.routes[0]) {
      throw new Error("No route found in optimization response");
    }

    const optimizedRoute = solution.routes[0];

    const steps: RouteStep[] = await Promise.all(
      optimizedRoute.activities
        .filter((activity: GraphHopperActivity) => activity.type === "service")
        .map(async (activity: GraphHopperActivity) => {
          const routeDetails = await calculateRoute(
            activity.address.lat,
            activity.address.lon,
            storeLat,
            storeLng,
            true,
          );

          const path = routeDetails.paths[0];

          return {
            orderId: activity.id,
            latitude: activity.address.lat,
            longitude: activity.address.lon,
            distance: path.distance,
            duration: path.time,
            instruction: path.instructions?.[0]?.text || "",
          };
        }),
    );

    return {
      distance: optimizedRoute.distance,
      duration: optimizedRoute.transport_time,
      steps,
    };
  } catch (error) {
    console.error("Route optimization error:", error);
    throw new CustomHttpError({
      message: "Failed to optimize delivery route",
      statusCode: 500,
      name: ERROR_NAME.DEFAULT,
    });
  }
}
