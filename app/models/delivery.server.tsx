import { DeliveryStatus } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getDeliveries() {
  return await prisma.delivery.findMany({
    include: {
      staff: true,
      DeliveryOrder: { include: { order: true } },
    },
  });
}
export async function getDeliveryInfo({ routeId }: { routeId: string }) {
  return await prisma.delivery.findUnique({
    where: { id: routeId },
    include: {
      DeliveryOrder: {
        include: {
          order: {
            include: {
              customer: true,
              OrderDetail: {
                include: {
                  border: true,
                  size: true,
                  topping: true,
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// Tạo một đơn giao hàng mới
export async function createDelivery(data: {
  staffId: string;
  deliveryOrderIds: string[];
}) {
  await prisma.order.updateMany({
    where: { id: { in: data.deliveryOrderIds } },
    data: { status: "SHIPPING", shipperId: data.staffId },
  });
  return await prisma.delivery.create({
    data: {
      staffId: data.staffId,
      status: "SHIPPING",
      DeliveryOrder: {
        create: data.deliveryOrderIds.map((orderId, index) => ({
          orderId,
          status: "PENDING",
          step: 0,
        })),
      },
    },
    include: {
      DeliveryOrder: true,
    },
  });
}

// Cập nhật trạng thái của đơn giao hàng
export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
) {
  return await prisma.delivery.update({
    where: { id: deliveryId },
    data: { status },
    include: {
      DeliveryOrder: true,
    },
  });
}

// Hoàn thành một đơn giao hàng
export async function completeDelivery(deliveryId: string) {
  return await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: { status: "COMPLETED" },
      include: {
        DeliveryOrder: true,
      },
    });

    await tx.deliveryOrder.updateMany({
      where: { deliveryId },
      data: { status: "COMPLETED" },
    });

    return delivery;
  });
}

// Hủy một đơn giao hàng
export async function cancelDelivery(deliveryId: string, cancelNote?: string) {
  return await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status: "CANCELLED",
      },
      include: {
        DeliveryOrder: true,
      },
    });

    await tx.deliveryOrder.updateMany({
      where: { deliveryId, status: { notIn: ["COMPLETED"] } },
      data: { status: "CANCELLED" },
    });

    return delivery;
  });
}
