import { prisma } from "~/lib/db.server";
import { calculateOptimalRoute } from "~/use-cases/shipping.server";

export async function getAvailableOrders() {
  return prisma.order.findMany({
    where: {
      status: "COOKED",
      deliveryStatus: "PENDING",
    },
    include: {
      customer: true,
      OrderDetail: {
        include: {
          product: true,
          border: true,
          size: true,
          topping: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function createDeliveryRoute(data: {
  shipperId: string;
  orderIds: string[];
}) {
  return await prisma.$transaction(async (tx) => {
    // Get orders with locations
    const orders = await tx.order.findMany({
      where: {
        id: { in: data.orderIds },
      },
      select: {
        id: true,
        address: true,
        address_lat: true,
        address_lng: true,
      },
    });

    // Calculate optimal route using GraphHopper
    const route = await calculateOptimalRoute(orders);

    // Create delivery route
    const deliveryRoute = await tx.deliveryRoute.create({
      data: {
        shipperId: data.shipperId,
        distance: route.distance,
        duration: route.duration,
        routeSteps: {
          create: route.steps.map((step, index) => ({
            orderId: step.orderId,
            stepNumber: index + 1,
            latitude: step.latitude,
            longitude: step.longitude,
            distance: step.distance,
            duration: step.duration,
            instruction: step.instruction,
          })),
        },
        orders: {
          connect: data.orderIds.map((id) => ({ id })),
        },
      },
    });

    // Update orders status
    await tx.order.updateMany({
      where: {
        id: { in: data.orderIds },
      },
      data: {
        deliveryStatus: "SHIPPING",
        shipperId: data.shipperId,
      },
    });

    return deliveryRoute;
  });
}

export async function startDeliveryRoute(routeId: string) {
  return prisma.$transaction(async (tx) => {
    const route = await tx.deliveryRoute.update({
      where: { id: routeId },
      data: {
        status: "SHIPPING",
        startTime: new Date(),
      },
      include: {
        orders: true,
      },
    });

    // Create initial location history for each order
    await Promise.all(
      route.orders.map((order) =>
        tx.orderLocationHistory.create({
          data: {
            orderId: order.id,
            latitude: order.address_lat,
            longitude: order.address_lng,
          },
        }),
      ),
    );

    return route;
  });
}

export async function completeDeliveryStep(
  routeId: string,
  orderId: string,
  currentLocation: {
    latitude: number;
    longitude: number;
  },
) {
  return prisma.$transaction(async (tx) => {
    // Update step status
    await tx.deliveryRouteStep.update({
      where: {
        deliveryRouteId_orderId: {
          deliveryRouteId: routeId,
          orderId: orderId,
        },
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        deliveryStatus: "COMPLETED",
      },
    });

    // Record location history
    await tx.orderLocationHistory.create({
      data: {
        orderId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
    });

    // Check if all steps are completed
    const remainingSteps = await tx.deliveryRouteStep.count({
      where: {
        deliveryRouteId: routeId,
        status: "PENDING",
      },
    });

    if (remainingSteps === 0) {
      await tx.deliveryRoute.update({
        where: { id: routeId },
        data: {
          status: "COMPLETED",
          endTime: new Date(),
        },
      });
    }
  });
}

export async function cancelDeliveryStep(
  routeId: string,
  orderId: string,
  cancelNote: string,
  currentLocation: {
    latitude: number;
    longitude: number;
  },
) {
  return prisma.$transaction(async (tx) => {
    await tx.deliveryRouteStep.update({
      where: {
        deliveryRouteId_orderId: {
          deliveryRouteId: routeId,
          orderId: orderId,
        },
      },
      data: {
        status: "CANCELLED",
        cancelNote,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        deliveryStatus: "CANCELLED",
      },
    });

    await tx.orderLocationHistory.create({
      data: {
        orderId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
    });
  });
}

export { calculateOptimalRoute };
