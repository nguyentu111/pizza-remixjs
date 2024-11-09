import { Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";

export async function seedRatings(tx: Prisma.TransactionClient) {
  console.log("Seeding ratings...");

  // Lấy tất cả các order đã completed
  const completedOrders = await tx.order.findMany({
    where: {
      status: "COMPLETED",
      rating: null, // Chỉ lấy những order chưa có rating
    },
  });

  const ratings = [];

  // Tạo rating cho khoảng 70% đơn hàng completed
  const ordersToRate = faker.helpers.arrayElements(
    completedOrders,
    Math.floor(completedOrders.length * 0.7),
  );

  for (const order of ordersToRate) {
    // Tạo rating với trọng số cao hơn cho điểm tốt
    const stars = faker.helpers.weightedArrayElement([
      { weight: 45, value: 5 }, // 45% chance
      { weight: 30, value: 4 }, // 30% chance
      { weight: 15, value: 3 }, // 15% chance
      { weight: 7, value: 2 }, // 7% chance
      { weight: 3, value: 1 }, // 3% chance
    ]);

    const rating = await tx.rating.create({
      data: {
        orderId: order.id,
        stars,
        description:
          stars <= 3
            ? faker.helpers.maybe(() => faker.lorem.sentence())
            : undefined,
        createdAt: faker.date.between({
          from: order.createdAt,
          to: new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // Within 7 days after order
        }),
      },
    });

    ratings.push(rating);
  }

  console.log(`✅ Seeded ${ratings.length} ratings`);
}
