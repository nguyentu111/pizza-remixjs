import { PrismaClient } from "@prisma/client";
import { seedCustomers } from "./customers";
import { seedStaff } from "./staff";
import { seedProducts } from "./products";
import { seedOrders } from "./orders";
import { seedDeliveries } from "./deliveries";
import { seedImports } from "./imports";
import { seedRatings } from "./ratings";
import { seedCoupons } from "./coupons";

const prisma = new PrismaClient();

async function cleanupData(tx: any) {
  console.log("Cleaning up existing data...");
  await tx.deliveryOrder.deleteMany();
  await tx.delivery.deleteMany();
  await tx.orderDetail.deleteMany();
  await tx.order.deleteMany();
  await tx.importMaterial.deleteMany();
  await tx.import.deleteMany();
  await tx.productTopping.deleteMany();
  await tx.productBorder.deleteMany();
  await tx.productSize.deleteMany();
  await tx.product.deleteMany();
  await tx.topping.deleteMany();
  await tx.border.deleteMany();
  await tx.size.deleteMany();
  await tx.category.deleteMany();
  await tx.material.deleteMany();
  await tx.provider.deleteMany();
  await tx.staffRole.deleteMany();
  await tx.staffPassword.deleteMany();
  await tx.staff.deleteMany();
  await tx.role.deleteMany();
  await tx.customerPassword.deleteMany();
  await tx.customer.deleteMany();
  await tx.rating.deleteMany();
  await tx.coupon.deleteMany();
}

export async function main() {
  console.log("🌱 Starting seed...");

  try {
    // Cleanup in a separate transaction
    await prisma.$transaction(
      async (tx) => {
        await cleanupData(tx);
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    // Seed basic data
    await prisma.$transaction(
      async (tx) => {
        await seedCustomers(tx);
        await seedStaff(tx);
        await seedProducts(tx);
        await seedCoupons(tx);
      },
      {
        maxWait: 10000,
        timeout: 60000,
      },
    );

    // Seed orders and deliveries
    await prisma.$transaction(
      async (tx) => {
        await seedOrders(tx);
        await seedDeliveries(tx);
      },
      {
        maxWait: 10000,
        timeout: 60000,
      },
    );

    // Seed imports in a separate transaction
    await prisma.$transaction(
      async (tx) => {
        await seedImports(tx);
      },
      {
        maxWait: 10000,
        timeout: 120000, // Longer timeout for imports
      },
    );

    // Seed ratings in a separate transaction
    await prisma.$transaction(
      async (tx) => {
        await seedRatings(tx);
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed with error:");
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
