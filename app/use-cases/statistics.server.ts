import { format } from "date-fns";
import { prisma } from "~/lib/db.server";

export async function getRevenueStats(
  startDate: Date,
  endDate: Date,
  period: "day" | "month" | "year",
) {
  const revenue = await prisma.order.groupBy({
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
    orderBy: {
      createdAt: "asc",
    },
  });

  // Format data for chart based on period
  const revenueData = revenue.map((item) => {
    const date = format(
      item.createdAt,
      period === "year"
        ? "yyyy"
        : period === "month"
          ? "MM/yyyy"
          : "dd/MM/yyyy",
    );

    return {
      date,
      revenue: Number(item._sum.totalAmount) || 0,
    };
  });

  // Group by formatted date to combine values for same month/year
  const groupedData = revenueData.reduce(
    (acc, curr) => {
      const existingEntry = acc.find((item) => item.date === curr.date);
      if (existingEntry) {
        existingEntry.revenue += curr.revenue;
      } else {
        acc.push(curr);
      }
      return acc;
    },
    [] as Array<{ date: string; revenue: number }>,
  );

  return groupedData;
}

export async function getOverallStats(currentMonthStart: Date) {
  const [
    totalRevenue,
    monthlyRevenue,
    orderStats,
    totalCustomers,
    newCustomersThisMonth,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: currentMonthStart },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.customer.count(),
    prisma.customer.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
  ]);

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
  const results = await prisma.material.findMany({
    where: {
      Inventory: {
        some: {}, // Ensures the material is associated with inventory rows
      },
    },
    include: {
      Inventory: true, // Include related inventory data for calculation
    },
  });

  // Filter results based on total inventory quantity compared to warning limits
  const filteredResults = results.filter((material) => {
    const totalQuantity = material.Inventory.reduce((sum, inventory) => {
      return sum + Number(inventory.quantity);
    }, 0);

    return totalQuantity < Number(material.warningLimits);
  });

  return filteredResults;
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
