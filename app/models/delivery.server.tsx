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
