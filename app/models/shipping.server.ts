import { prisma } from "~/lib/db.server";
import { calculateOptimalRoute } from "~/use-cases/shipping.server";

export async function getAvailableOrders() {
  return prisma.order.findMany({
    where: {
      status: "COOKED",
      DeliveryOrder: null,
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
  return await prisma.$transaction(
    async (tx) => {
      // Get orders with locations
      const orders = await tx.order.findMany({
        where: {
          id: { in: data.orderIds },
          status: "COOKED",
          DeliveryOrder: null,
        },
        select: {
          id: true,
          address: true,
          address_lat: true,
          address_lng: true,
          // Ensure to include any new fields if necessary
        },
      });

      if (orders.length === 0) {
        throw new Error("No valid orders found");
      }

      // Calculate optimal route using GraphHopper
      const route = await calculateOptimalRoute(orders);
      console.dir(route, { depth: null });
      // Create delivery route
      const deliveryRoute = await tx.delivery.create({
        data: {
          staffId: data.shipperId,
          status: "SHIPPING",
          // Ensure to include any new fields if necessary
          DeliveryOrder: {
            create: route.steps.map((step, index) => ({
              orderId: step.orderId,
              cancelNote: null,
              endTime: null,
              startTime: index === 0 ? new Date() : null,
              status: index === 0 ? "SHIPPING" : "PENDING",
            })),
          },
        },
        include: {
          DeliveryOrder: true,
        },
      });

      return deliveryRoute;
    },
    { timeout: 10000 },
  );
}
export async function startDeliveryRoute(routeId: string) {
  return prisma.$transaction(async (tx) => {
    const route = await tx.delivery.update({
      where: { id: routeId },
      data: {
        status: "SHIPPING",
      },
      include: {
        DeliveryOrder: true,
      },
    });

    // Update orders status
    await tx.order.updateMany({
      where: {
        id: { in: route.DeliveryOrder.map((o) => o.orderId) },
      },
      data: {
        status: "SHIPPING",
      },
    });

    return route;
  });
}

export async function completeDeliveryOrder(deliveryOrderId: string) {
  return prisma.$transaction(async (tx) => {
    // Update step status
    const deliveryOrder = await tx.deliveryOrder.findUnique({
      where: { id: deliveryOrderId },
    });
    if (!deliveryOrder) {
      throw new Error("Delivery order not found");
    }
    await tx.deliveryOrder.update({
      where: {
        id: deliveryOrderId,
      },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
      },
    });

    // Update order status
    await tx.order.update({
      where: { id: deliveryOrder.orderId },
      data: {
        status: "COMPLETED",
        paymentStatus: "PAID",
      },
    });

    const remainingSteps = await tx.deliveryOrder.count({
      where: {
        deliveryId: deliveryOrder.deliveryId,
        status: "PENDING",
      },
    });

    if (remainingSteps === 0) {
      await tx.delivery.update({
        where: { id: deliveryOrder.deliveryId },
        data: {
          status: "COMPLETED",
        },
      });
    }
  });
}

export async function cancelDeliveryOrder(
  deliveryOrderId: string,
  cancelNote?: string,
) {
  return prisma.$transaction(async (tx) => {
    const deliveryOrder = await tx.deliveryOrder.findUnique({
      where: { id: deliveryOrderId },
    });
    if (!deliveryOrder) {
      throw new Error("Delivery order not found");
    }
    await tx.deliveryOrder.update({
      where: {
        id: deliveryOrderId,
      },
      data: {
        status: "CANCELLED",
        cancelNote,
      },
    });

    await tx.order.update({
      where: { id: deliveryOrder.orderId },
      data: {
        status: "CANCELLED",
      },
    });
    
    const remainingSteps = await tx.deliveryOrder.count({
      where: {
        deliveryId: deliveryOrder.deliveryId,
        status: "PENDING",
      },
    });

    if (remainingSteps === 0) {
      await tx.delivery.update({
        where: { id: deliveryOrder.deliveryId },
        data: {
          status: "COMPLETED",
        },
      });
    }
  });
}
export async function startDeliveryOrder(deliveryOrderId: string) {
  const deliveryOrder = await prisma.deliveryOrder.findUnique({
    where: { id: deliveryOrderId },
  });
  if (!deliveryOrder) {
    throw new Error("Delivery order not found");
  }
  await prisma.deliveryOrder.update({
    where: { id: deliveryOrderId },
    data: { status: "SHIPPING" },
  });
  await prisma.order.update({
    where: { id: deliveryOrder.orderId },
    data: { status: "SHIPPING" },
  });
}