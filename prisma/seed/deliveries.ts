import {
  PrismaClient,
  DeliveryStatus,
  DeliveryOrderStatus,
  Prisma,
} from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";

export async function seedDeliveries(tx: Prisma.TransactionClient) {
  console.log("Seeding deliveries...");

  // Get all orders that need delivery and haven't been assigned
  const orders = await tx.order.findMany({
    where: {
      status: {
        in: ["SHIPPING", "COMPLETED"],
      },
      DeliveryOrder: null, // Only get orders that haven't been assigned to a delivery
    },
  });

  if (orders.length === 0) {
    console.log("No orders available for delivery");
    return;
  }

  // Get all staff with Shipper role
  const shippers = await tx.staff.findMany({
    include: {
      Roles: {
        where: {
          role: {
            name: "Shipper",
          },
        },
      },
    },
  });

  if (shippers.length === 0) {
    throw new Error(
      "No shippers found. Please seed staff with Shipper role first.",
    );
  }

  const deliveries = [];

  // Group orders by date to create deliveries
  const ordersByDate = orders.reduce(
    (acc, order) => {
      const date = order.createdAt.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    },
    {} as Record<string, typeof orders>,
  );

  for (const [date, dateOrders] of Object.entries(ordersByDate)) {
    // Create 1-3 deliveries per day
    const deliveryCount = Math.min(
      faker.number.int({ min: 1, max: 3 }),
      Math.ceil(dateOrders.length / 5), // Make sure we have enough deliveries for all orders
    );

    // Split orders among deliveries
    const ordersPerDelivery = Math.ceil(dateOrders.length / deliveryCount);

    for (let i = 0; i < deliveryCount; i++) {
      const shipper = faker.helpers.arrayElement(shippers);

      // Get the orders for this delivery
      const startIdx = i * ordersPerDelivery;
      const endIdx = Math.min(startIdx + ordersPerDelivery, dateOrders.length);
      const deliveryOrders = dateOrders.slice(startIdx, endIdx);

      const delivery = await tx.delivery.create({
        data: {
          staffId: shipper.id,
          status: faker.helpers.arrayElement([
            "SHIPPING",
            "COMPLETED",
            "CANCELLED",
          ] as DeliveryStatus[]),
        },
      });

      // Create DeliveryOrder for each order in this batch
      for (const order of deliveryOrders) {
        const status = faker.helpers.arrayElement(
          Object.values(DeliveryOrderStatus),
        );
        await tx.deliveryOrder.create({
          data: {
            deliveryId: delivery.id,
            orderId: order.id,
            status,
            startTime: order.createdAt,
            endTime:
              status !== "CANCELLED" && status !== "COMPLETED"
                ? faker.helpers.maybe(() =>
                    faker.date.soon({ refDate: order.createdAt }),
                  )
                : faker.date.soon({ refDate: order.createdAt }),
          },
        });
      }

      deliveries.push(delivery);
    }
  }

  console.log(`✅ Seeded ${deliveries.length} deliveries`);
}
