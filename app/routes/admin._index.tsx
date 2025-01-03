import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { parseISO, startOfMonth, subMonths } from "date-fns";
import { motion } from "framer-motion";
import { CouponStatsCard } from "~/components/admin/dashboard/coupon-stats-card";
import { CustomersCard } from "~/components/admin/dashboard/customers-card";
import { DeliveryStatsCard } from "~/components/admin/dashboard/delivery-stats-card";
import { InventoryAlertsCard } from "~/components/admin/dashboard/inventory-alerts-card";
import { InventoryStatsCard } from "~/components/admin/dashboard/inventory-stats-card";
import { OrdersCard } from "~/components/admin/dashboard/orders-card";
import { RatingStatsCard } from "~/components/admin/dashboard/rating-stats-card";
import { RevenueByProductChart } from "~/components/admin/dashboard/revenue-by-product-chart";
import { RevenueCard } from "~/components/admin/dashboard/revenue-card";
import { RevenueComparisonChart } from "~/components/admin/dashboard/revenue-comparison-chart";
import { TopProductsChart } from "~/components/admin/dashboard/top-products-chart";
import { Masonry } from "~/components/ui/masonry";
import { getCouponStats } from "~/use-cases/coupon-stats.server";
import { getDeliveryStats } from "~/use-cases/delivery-stats.server";
import { getInventoryStats } from "~/use-cases/inventory-stats.server";
import { getRatingStats } from "~/use-cases/rating-stats.server";
import {
  getLowStockMaterials,
  getOverallStats,
  getProductStats,
  getRevenueByCategory,
  getRevenueStats,
} from "~/use-cases/statistics.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const period =
    (url.searchParams.get("period") as "day" | "month" | "year") || "day";

  const startDate = from ? parseISO(from) : subMonths(new Date(), 1);
  const endDate = to ? parseISO(to) : new Date();
  const currentMonthStart = startOfMonth(new Date());

  const [
    revenueData,
    overallStats,
    productStats,
    lowStockMaterials,
    revenueByCategoryStats,
    couponStats,
    ratingStats,
    deliveryStats,
    inventoryStats,
  ] = await Promise.all([
    getRevenueStats(startDate, endDate, period),
    getOverallStats(currentMonthStart),
    getProductStats(),
    getLowStockMaterials(),
    getRevenueByCategory(),
    getCouponStats(),
    getRatingStats(),
    getDeliveryStats(),
    getInventoryStats(),
  ]);

  return json({
    ...overallStats,
    topProducts: productStats,
    lowStockMaterials,
    revenueByCategory: revenueByCategoryStats,
    revenueComparison: {
      data: revenueData,
      startDate,
      endDate,
      period,
    },
    couponStats,
    ratingStats,
    deliveryStats,
    inventoryStats: {
      providers: inventoryStats.providers,
      totalImports: inventoryStats.totalImports,
      totalMaterials: inventoryStats.totalMaterials,
      averageQualityRate: inventoryStats.averageQualityRate,
    },
  });
}

export default function AdminDashboard() {
  const data = useLoaderData<typeof loader>();

  // Định nghĩa animation variants cho container chính
  const pageContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
      },
    },
  };

  // Định nghĩa animation variants cho từng item
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  // Thêm variants mới cho container của 3 thẻ
  const cardsContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Điều chỉnh độ trễ giữa các thẻ
        delayChildren: 0.1, // Độ trễ trước khi bắt đầu animation
      },
    },
  };

  // Variants cho từng thẻ con
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Thêm variants mới cho container của 2 thẻ
  const statsCardsContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Độ trễ giữa 2 thẻ
        delayChildren: 0.1, // Độ trễ trước khi bắt đầu
        duration: 0.5,
      },
    },
  };

  // Variants cho từng thẻ thống kê
  const statsCardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="show"
      className="p-6"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6">
        Tổng quan
      </motion.h1>

      <motion.div
        variants={cardsContainerVariants}
        className="flex flex-col md:flex-row gap-6 flex-wrap"
      >
        <motion.div variants={cardVariants}>
          <motion.div
            variants={statsCardsContainerVariants}
            className="flex flex-col gap-6"
          >
            <motion.div variants={statsCardVariants}>
              <RevenueCard
                total={data.revenue.total}
                monthly={data.revenue.monthly}
              />
            </motion.div>
            <motion.div variants={statsCardVariants}>
              <CustomersCard
                total={data.customers.total}
                newThisMonth={data.customers.newThisMonth}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div variants={cardVariants} className="flex-1 min-w-[300px]">
          <OrdersCard orders={data.orders} />
        </motion.div>

        <motion.div variants={cardVariants}>
          <InventoryAlertsCard materials={data.lowStockMaterials as any} />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Masonry
          className="mt-6"
          breakpointCols={{
            default: 2,
            1024: 2,
            768: 1,
            640: 1,
          }}
        >
          <motion.div variants={itemVariants}>
            <TopProductsChart products={data.topProducts as any} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <RevenueByProductChart data={data.revenueByCategory} />
          </motion.div>
        </Masonry>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <RevenueComparisonChart
          data={data.revenueComparison.data}
          startDate={new Date(data.revenueComparison.startDate)}
          endDate={new Date(data.revenueComparison.endDate)}
          period={data.revenueComparison.period}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Masonry
          className="mt-6"
          breakpointCols={{
            default: 2,
            1024: 2,
            768: 1,
            640: 1,
          }}
        >
          <motion.div variants={itemVariants}>
            <CouponStatsCard {...data.couponStats} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InventoryStatsCard {...data.inventoryStats} />
          </motion.div>
        </Masonry>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <RatingStatsCard stats={data.ratingStats as any} />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <DeliveryStatsCard stats={data.deliveryStats as any} />
      </motion.div>
    </motion.div>
  );
}
