import { prisma } from "~/lib/db.server";
import { format, subMonths, subYears } from "date-fns";

export async function getRevenueStats(
  startDate: Date,
  endDate: Date,
  period: "day" | "month" | "year",
) {
  // Get current period revenue
  const currentPeriodRevenue = await prisma.order.groupBy({
    by: ["createdAt"],
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Get previous period dates
  const previousStartDate =
    period === "year" ? subYears(startDate, 1) : subMonths(startDate, 1);
  const previousEndDate =
    period === "year" ? subYears(endDate, 1) : subMonths(endDate, 1);

  // Get previous period revenue
  const previousPeriodRevenue = await prisma.order.groupBy({
    by: ["createdAt"],
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Format data for chart
  const revenueData = currentPeriodRevenue.map((item) => {
    const date = format(
      item.createdAt,
      period === "year"
        ? "yyyy"
        : period === "month"
          ? "MM/yyyy"
          : "dd/MM/yyyy",
    );
    const previousDate =
      period === "year"
        ? format(subYears(item.createdAt, 1), "yyyy")
        : format(
            subMonths(item.createdAt, 1),
            period === "month" ? "MM/yyyy" : "dd/MM/yyyy",
          );

    const previousRevenue = previousPeriodRevenue.find(
      (prev) =>
        format(
          prev.createdAt,
          period === "year"
            ? "yyyy"
            : period === "month"
              ? "MM/yyyy"
              : "dd/MM/yyyy",
        ) === previousDate,
    );

    return {
      date,
      currentRevenue: Number(item._sum.totalAmount) || 0,
      previousRevenue: Number(previousRevenue?._sum.totalAmount) || 0,
    };
  });

  return revenueData;
}

export async function getOverallStats(currentMonthStart: Date) {
  const totalRevenue = await prisma.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalAmount: true },
  });

  const monthlyRevenue = await prisma.order.aggregate({
    where: {
      status: "COMPLETED",
      createdAt: { gte: currentMonthStart },
    },
    _sum: { totalAmount: true },
  });

  const orderStats = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const totalCustomers = await prisma.customer.count();
  const newCustomersThisMonth = await prisma.customer.count({
    where: { createdAt: { gte: currentMonthStart } },
  });

  return {
    revenue: {
      total: Number(totalRevenue._sum.totalAmount) || 0,
      monthly: Number(monthlyRevenue._sum.totalAmount) || 0,
    },
    orders: orderStats,
    customers: {
      total: totalCustomers,
      newThisMonth: newCustomersThisMonth,
    },
  };
}

export async function getProductStats() {
  const topProducts = await prisma.orderDetail.groupBy({
    by: ["productId"],
    _count: true,
    _sum: { quantity: true },
    orderBy: { _count: { productId: "desc" } },
    take: 5,
    having: {
      productId: { not: "" },
    },
  });

  const productsWithNames = await Promise.all(
    topProducts.map(async (product) => {
      const productDetails = await prisma.product.findUnique({
        where: { id: product.productId },
        select: { name: true },
      });
      return {
        ...product,
        name: productDetails?.name || "Unknown Product",
      };
    }),
  );

  return productsWithNames;
}

export async function getLowStockMaterials() {
  return prisma.material.findMany({
    where: {
      Inventory: {
        some: {
          quantity: { lt: 10 },
        },
      },
    },
    include: {
      Inventory: true,
    },
    take: 5,
  });
}

export async function getRevenueByCategory() {
  // Lấy doanh thu theo sản phẩm và join với bảng Product để lấy tên
  const revenueByProduct = await prisma.orderDetail.groupBy({
    by: ["productId"],
    where: {
      order: {
        status: "COMPLETED",
      },
    },
    _sum: {
      totalAmount: true,
      quantity: true,
    },
    having: {
      productId: { not: "" },
    },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
    take: 5,
  });

  const productsWithNames = await Promise.all(
    revenueByProduct.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true },
      });

      return {
        name: product?.name || "Unknown Product",
        _sum: {
          totalAmount: Number(item._sum.totalAmount) || 0,
          quantity: Number(item._sum.quantity) || 0,
        },
      };
    }),
  );

  return productsWithNames;
}
