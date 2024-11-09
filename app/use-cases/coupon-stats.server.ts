import { prisma } from "~/lib/db.server";

export async function getCouponStats() {
  const totalCoupons = await prisma.coupon.count();

  const couponUsageStats = await prisma.order.groupBy({
    by: ["couponId"],
    where: {
      couponId: { not: null },
      status: "COMPLETED",
    },
    _count: true,
  });

  const usedCoupons = couponUsageStats.length;

  const totalDiscount = await prisma.order.aggregate({
    where: {
      couponId: { not: null },
      status: "COMPLETED",
    },
    _sum: {
      totalAmount: true,
    },
  });

  const topCouponsRaw = await prisma.order.groupBy({
    by: ["couponId"],
    where: {
      couponId: { not: null },
      status: "COMPLETED",
    },
    _count: true,
    _sum: {
      totalAmount: true,
    },
    orderBy: {
      _count: {
        couponId: "desc",
      },
    },
    take: 5,
  });

  const topCoupons = await Promise.all(
    topCouponsRaw.map(async (stat) => {
      const coupon = await prisma.coupon.findUnique({
        where: { id: stat.couponId! },
        select: { code: true, name: true },
      });

      return {
        code: coupon?.code || "Unknown",
        name: coupon?.name || "Unknown",
        usageCount: stat._count,
        totalDiscount: Number(stat._sum.totalAmount) || 0,
      };
    }),
  );

  return {
    totalCoupons,
    usedCoupons,
    totalDiscount: Number(totalDiscount._sum.totalAmount) || 0,
    topCoupons,
  };
}
