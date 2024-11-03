import { Order, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getOrders() {
  return prisma.order.findMany({
    include: {
      OrderDetail: {
        include: {
          product: true,
          size: true,
          border: true,
          topping: true,
        },
      },
      customer: true,
      DeliveryOrder: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createOrder(
  db: Prisma.TransactionClient,
  data: {
    address: string;
    address_lat: number;
    address_lng: number;
    shipNote?: string;
    shippingFee: number;
    totalAmount: number;
    customerId: string;
    couponId?: string;
    paymentStatus?: PaymentStatus;
    orderDetails: Array<{
      productId: string;
      sizeId: string;
      borderId?: string;
      toppingId?: string;
      quantity: number;
      totalAmount: number;
    }>;
  },
) {
  return db.order.create({
    data: {
      address: data.address,
      address_lat: data.address_lat,
      address_lng: data.address_lng,
      shipNote: data.shipNote,
      shippingFee: data.shippingFee,
      totalAmount: data.totalAmount,
      status: "PENDING",
      paymentStatus: data.paymentStatus || "UNPAID",
      customer: { connect: { id: data.customerId } },
      coupon: data.couponId ? { connect: { id: data.couponId } } : undefined,
      OrderDetail: {
        create: data.orderDetails,
      },
    },
    include: {
      OrderDetail: {
        include: {
          product: {
            select: {
              name: true,
              image: true,
            },
          },
          size: {
            select: {
              name: true,
            },
          },
          border: {
            select: {
              name: true,
            },
          },
          topping: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getOrderById(
  db: Prisma.TransactionClient,
  id: Order["id"],
) {
  return db.order.findUnique({
    where: { id },
    include: {
      OrderDetail: {
        include: {
          product: {
            select: {
              name: true,
              image: true,
            },
          },
          size: {
            select: {
              name: true,
            },
          },
          border: {
            select: {
              name: true,
            },
          },
          topping: {
            select: {
              name: true,
            },
          },
        },
      },
      coupon: true,
      customer: true,
    },
  });
}

export async function getCustomerOrders(
  db: Prisma.TransactionClient,
  customerId: string,
) {
  return db.order.findMany({
    where: { customerId },
    include: {
      OrderDetail: {
        include: {
          product: {
            select: {
              name: true,
              image: true,
            },
          },
          size: {
            select: {
              name: true,
            },
          },
          border: {
            select: {
              name: true,
            },
          },
          topping: {
            select: {
              name: true,
            },
          },
        },
      },
      rating: {
        select: {
          stars: true,
          description: true,
        },
      },
      coupon: {
        select: {
          code: true,
          discount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderPaymentStatus(
  db: Prisma.TransactionClient,
  id: Order["id"],
  paymentStatus: PaymentStatus,
) {
  return db.order.update({
    where: { id },
    data: {
      paymentStatus,
    },
  });
}
