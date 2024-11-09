import { prisma } from "~/lib/db.server";

export async function getRatingStats() {
  const totalOrders = await prisma.order.count({
    where: { status: "COMPLETED" },
  });

  const ratings = await prisma.rating.findMany({
    include: {
      order: {
        include: {
          customer: true,
        },
      },
    },
  });

  const totalRatings = ratings.length;
  const responseRate = totalRatings > 0 ? totalRatings / totalOrders : 0;
  const averageRating =
    totalRatings > 0
      ? ratings.reduce((acc, curr) => acc + curr.stars, 0) / totalRatings
      : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map((stars) => ({
    stars,
    count: ratings.filter((r) => r.stars === stars).length,
  }));

  const recentRatings = ratings
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((rating) => ({
      orderId: rating.orderId,
      customerName: rating.order.customer.fullname,
      stars: rating.stars,
      description: rating.description,
      createdAt: rating.createdAt,
    }));

  return {
    averageRating,
    responseRate,
    totalOrders,
    totalRatings,
    ratingDistribution,
    recentRatings,
  };
}
