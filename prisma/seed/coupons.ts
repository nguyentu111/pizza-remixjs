import { Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";

export async function seedCoupons(tx: Prisma.TransactionClient) {
  console.log("Seeding coupons...");

  // Get staff with Admin role for createdBy
  const admin = await tx.staff.findFirst({
    where: {
      Roles: {
        some: {
          role: {
            name: "Admin",
          },
        },
      },
    },
  });

  if (!admin) {
    throw new Error("No admin found. Please seed staff with Admin role first.");
  }

  // Get media for coupon images
  const couponMedia = await tx.media.findMany({
    where: {
      type: "coupon",
    },
  });

  const coupons = [
    {
      code: "WELCOME2024",
      name: "Chào mừng năm mới 2024",
      description: "Giảm 20% cho đơn hàng đầu tiên",
      discount: 20,
      quantity: 1000,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
    {
      code: "PIZZA50K",
      name: "Giảm 50K cho đơn từ 200K",
      description: "Áp dụng cho tất cả các đơn hàng từ 200.000đ",
      discount: 50,
      quantity: 500,
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-03-31"),
    },
    {
      code: "FREESHIP",
      name: "Miễn phí giao hàng",
      description: "Miễn phí giao hàng cho đơn từ 300.000đ",
      discount: 30,
      quantity: 300,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-06-30"),
    },
    {
      code: "COMBO149K",
      name: "Combo tiết kiệm chỉ 149K",
      description: "Giảm 30% cho combo 2 người",
      discount: 30,
      quantity: 200,
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-04-30"),
    },
    {
      code: "WEEKEND30",
      name: "Giảm giá cuối tuần",
      description: "Giảm 30K cho đơn hàng vào T7, CN",
      discount: 10,
      quantity: 1000,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
    {
      code: "BIRTHDAY",
      name: "Quà sinh nhật",
      description: "Giảm 25% nhân dịp sinh nhật",
      discount: 25,
      quantity: 1000,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
    {
      code: "SUMMER2024",
      name: "Khuyến mãi hè 2024",
      description: "Giảm 15% cho tất cả đơn hàng",
      discount: 15,
      quantity: 800,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-08-31"),
    },
    {
      code: "PAYDAY25",
      name: "Ưu đãi ngày lương",
      description: "Giảm 25K cho đơn từ 150K",
      discount: 25,
      quantity: 500,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
    {
      code: "NEWSTORE",
      name: "Khai trương chi nhánh mới",
      description: "Giảm 40% cho chi nhánh mới",
      discount: 40,
      quantity: 300,
      startDate: new Date("2024-04-01"),
      endDate: new Date("2024-04-30"),
    },
    {
      code: "LUNCH40K",
      name: "Ưu đãi bữa trưa",
      description: "Giảm 40K cho đơn hàng từ 11h-14h",
      discount: 40,
      quantity: 1000,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
    {
      code: "APP100K",
      name: "Ưu đãi đặt qua app",
      description: "Giảm 100K cho đơn đầu tiên qua app",
      discount: 90,
      quantity: 200,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
    {
      code: "FAMILY35",
      name: "Ưu đãi gia đình",
      description: "Giảm 35% cho combo gia đình",
      discount: 35,
      quantity: 400,
      startDate: new Date("2024-02-15"),
      endDate: new Date("2024-05-15"),
    },
    {
      code: "SPECIAL80K",
      name: "Ưu đãi đặc biệt",
      description: "Giảm 80K cho đơn từ 400K",
      discount: 80,
      quantity: 150,
      startDate: new Date("2024-03-15"),
      endDate: new Date("2024-04-15"),
    },
    {
      code: "STUDENT25",
      name: "Ưu đãi học sinh sinh viên",
      description: "Giảm 25% khi có thẻ học sinh, sinh viên",
      discount: 25,
      quantity: 600,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
    {
      code: "NEWYEAR50",
      name: "Đón năm mới 2024",
      description: "Giảm 50% cho đơn đầu tiên trong năm",
      discount: 50,
      quantity: 100,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    },
  ];

  // Create coupons
  for (const coupon of coupons) {
    // Randomly assign images from couponMedia
    const image = faker.helpers.maybe(
      () => faker.helpers.arrayElement(couponMedia)?.url,
    );
    const bannerImage = faker.helpers.maybe(
      () => faker.helpers.arrayElement(couponMedia)?.url,
    );

    await tx.coupon.create({
      data: {
        ...coupon,
        image,
        bannerImage,
        createdById: admin.id,
      },
    });
  }

  console.log(`✅ Seeded ${coupons.length} coupons`);
}
