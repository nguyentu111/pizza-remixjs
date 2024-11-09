import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";

export async function seedOrders(tx: Prisma.TransactionClient) {
  console.log("Seeding orders...");

  const customers = await tx.customer.findMany();
  const staff = await tx.staff.findMany();
  const products = await tx.product.findMany({
    include: {
      Sizes: {
        include: {
          size: true,
        },
      },
      Borders: {
        include: {
          border: true,
        },
      },
      Toppings: {
        include: {
          topping: true,
        },
      },
    },
  });

  if (!customers.length || !staff.length || !products.length) {
    throw new Error(
      "Required seed data is missing. Make sure customers, staff, and products are seeded first.",
    );
  }

  const orders = [];

  // Get available coupons
  const coupons = await tx.coupon.findMany({
    where: {
      quantity: {
        gt: 0,
      },
      startDate: {
        lte: new Date(),
      },
      endDate: {
        gte: new Date(),
      },
    },
  });

  for (let i = 0; i < 500; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const chef = faker.helpers.arrayElement(staff);
    const shipper = faker.helpers.arrayElement(staff);

    const orderDate = faker.date.between({
      from: new Date("2024-01-01"),
      to: new Date(),
    });

    const shippingFee = faker.number.int({ min: 15000, max: 50000 }).toString();

    let order = await tx.order.create({
      data: {
        customerId: customer.id,
        chefId: chef.id,
        shipperId: shipper.id,
        address: faker.location.streetAddress(),
        address_lat: faker.number.int({ min: 10, max: 11 }).toString(),
        address_lng: faker.number.int({ min: 106, max: 107 }).toString(),
        shipNote: faker.helpers.maybe(() => faker.lorem.sentence()),
        shippingFee,
        totalAmount: "0",
        status: faker.helpers.arrayElement(Object.values(OrderStatus)),
        paymentStatus: faker.helpers.arrayElement(Object.values(PaymentStatus)),
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    });

    const orderDetailsCount = faker.number.int({ min: 1, max: 3 });
    let totalAmount = 0;

    for (let j = 0; j < orderDetailsCount; j++) {
      const product = faker.helpers.arrayElement(products);
      if (product.Sizes.length === 0) continue;

      const productSize = faker.helpers.arrayElement(product.Sizes);
      const productBorder =
        product.Borders.length > 0
          ? faker.helpers.maybe(() =>
              faker.helpers.arrayElement(product.Borders),
            )
          : null;
      const productTopping =
        product.Toppings.length > 0
          ? faker.helpers.maybe(() =>
              faker.helpers.arrayElement(product.Toppings),
            )
          : null;

      const quantity = faker.number.int({ min: 1, max: 5 });
      const itemAmount =
        (productSize.price +
          (productBorder?.border.price || 0) +
          (productTopping?.topping.price || 0)) *
        quantity;

      totalAmount += itemAmount;

      await tx.orderDetail.create({
        data: {
          orderId: order.id,
          productId: product.id,
          borderId: productBorder?.borderId,
          sizeId: productSize.sizeId,
          toppingId: productTopping?.toppingId,
          quantity,
          totalAmount: itemAmount.toString(),
        },
      });
    }

    // Randomly apply coupon (30% chance)
    const applyCoupon = faker.helpers.maybe(() => true, { probability: 0.3 });
    let couponDiscount = 0;

    if (applyCoupon && coupons.length > 0) {
      const coupon = faker.helpers.arrayElement(coupons);

      // Calculate discount
      if (Number.isInteger(Number(coupon.discount))) {
        // Fixed amount discount
        couponDiscount = Number(coupon.discount);
      } else {
        // Percentage discount
        couponDiscount = Math.floor(totalAmount * Number(coupon.discount));
      }

      // Update order with coupon
      order = await tx.order.update({
        where: { id: order.id },
        data: {
          couponId: coupon.id,
          totalAmount: (
            totalAmount +
            parseInt(shippingFee) -
            couponDiscount
          ).toString(),
        },
      });

      // Update coupon quantity
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
    } else {
      // Update order total without coupon
      await tx.order.update({
        where: { id: order.id },
        data: {
          totalAmount: (totalAmount + parseInt(shippingFee)).toString(),
        },
      });
    }

    orders.push(order);
  }

  console.log(`✅ Created ${orders.length} orders!`);
}
