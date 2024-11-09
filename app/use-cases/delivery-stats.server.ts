import { prisma } from "~/lib/db.server";

export async function getDeliveryStats() {
  const deliveryOrders = await prisma.deliveryOrder.findMany({
    include: {
      order: {
        include: {
          customer: true,
        },
      },
    },
  });

  const totalDeliveries = deliveryOrders.length;

  const statusDistribution = await prisma.deliveryOrder.groupBy({
    by: ["status"],
    _count: true,
  });

  const completedDeliveries = deliveryOrders.filter(
    (delivery) =>
      delivery.status === "COMPLETED" && delivery.startTime && delivery.endTime,
  );

  const averageDeliveryTime =
    completedDeliveries.length > 0
      ? completedDeliveries.reduce((acc, delivery) => {
          const duration =
            delivery.endTime!.getTime() - delivery.startTime!.getTime();
          return acc + duration / (1000 * 60); // Convert to minutes
        }, 0) / completedDeliveries.length
      : 0;

  const cancelledOrders = deliveryOrders.filter(
    (delivery) => delivery.status === "CANCELLED",
  );

  const reasonCounts = cancelledOrders.reduce(
    (acc, order) => {
      const reason = order.cancelNote || "Không có lý do";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const returnedOrders = {
    total: cancelledOrders.length,
    reasons: Object.entries(reasonCounts).map(([reason, count]) => ({
      reason,
      count,
    })),
  };

  const recentReturns = cancelledOrders
    .sort((a, b) => b.endTime!.getTime() - a.endTime!.getTime())
    .slice(0, 5)
    .map((delivery) => ({
      orderId: delivery.orderId,
      customerName: delivery.order.customer.fullname,
      reason: delivery.cancelNote || "Không có lý do",
      returnDate: delivery.endTime!,
    }));

  return {
    statusDistribution: statusDistribution.map((status) => ({
      status: status.status,
      count: status._count,
    })),
    averageDeliveryTime,
    totalDeliveries,
    returnedOrders,
    recentReturns,
  };
}
