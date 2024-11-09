import { Order, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "~/lib/db.server";
import { Decimal } from "@prisma/client/runtime/library";
import { CustomHttpError, ERROR_NAME } from "~/lib/error";

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
  // Collect all material requirements
  let allMaterialRequirements: Array<{
    materialId: string;
    requiredQuantity: number;
    materialName: string;
  }> = [];

  // Check recipe requirements for each product
  for (const detail of data.orderDetails) {
    // Get product recipe requirements
    const productRequirements = await getProductRecipeRequirements(
      db,
      detail.productId,
      detail.quantity,
    );
    allMaterialRequirements.push(...productRequirements);

    // Get topping requirements if exists
    if (detail.toppingId) {
      const toppingRequirements = await getToppingRecipeRequirements(
        db,
        detail.toppingId,
        detail.quantity,
      );
      if (toppingRequirements) {
        allMaterialRequirements.push(toppingRequirements);
      }
    }
  }

  // Combine requirements for same materials
  const combinedRequirements = allMaterialRequirements.reduce(
    (acc, curr) => {
      const existing = acc.find((item) => item.materialId === curr.materialId);
      if (existing) {
        existing.requiredQuantity += curr.requiredQuantity;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    },
    [] as typeof allMaterialRequirements,
  );

  // Check inventory availability
  const insufficientMaterials = await checkInventoryAvailability(
    db,
    combinedRequirements,
  );

  if (insufficientMaterials.length > 0) {
    throw new CustomHttpError({
      message: `Không đủ nguyên liệu để chế biến, vui lòng đặt món khác b nhé!`,
      name: ERROR_NAME.INSUFFICIENT_MATERIALS,
      statusCode: 400,
    });
  }

  // Create order
  const order = await db.order.create({
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

  // Deduct inventory quantities
  await deductInventoryQuantities(db, combinedRequirements);

  return order;
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
            include: {
              Sizes: true,
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
      Payment: true,
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

// Add new helper functions
async function getProductRecipeRequirements(
  db: Prisma.TransactionClient,
  productId: string,
  quantity: number,
) {
  const recipes = await db.recipe.findMany({
    where: { productId },
    include: { material: true },
  });

  return recipes.map((recipe) => ({
    materialId: recipe.materialId,
    requiredQuantity: Number(recipe.quantity) * quantity,
    materialName: recipe.material.name,
  }));
}

async function getToppingRecipeRequirements(
  db: Prisma.TransactionClient,
  toppingId: string,
  quantity: number,
) {
  const topping = await db.topping.findUnique({
    where: { id: toppingId },
    include: { Material: true },
  });

  if (!topping || !topping.materialId) return null;

  return {
    materialId: topping.materialId,
    requiredQuantity: quantity, // Assuming 1 topping uses 1 unit of material
    materialName: topping.Material.name,
  };
}

async function checkInventoryAvailability(
  db: Prisma.TransactionClient,
  materialRequirements: Array<{
    materialId: string;
    requiredQuantity: number;
    materialName: string;
  }>,
) {
  const insufficientMaterials = [];

  for (const requirement of materialRequirements) {
    const totalInventory = await db.inventory.aggregate({
      where: {
        materialId: requirement.materialId,
        quantity: { gt: 0 }, // Chỉ tính những inventory có số lượng > 0
      },
      _sum: { quantity: true },
    });

    const availableQuantity = Number(totalInventory._sum.quantity || 0);

    if (availableQuantity < requirement.requiredQuantity) {
      insufficientMaterials.push({
        materialName: requirement.materialName,
        required: requirement.requiredQuantity,
        available: availableQuantity,
      });
    }
  }

  return insufficientMaterials;
}

async function deductInventoryQuantities(
  db: Prisma.TransactionClient,
  materialRequirements: Array<{
    materialId: string;
    requiredQuantity: number;
  }>,
) {
  for (const requirement of materialRequirements) {
    let remainingQuantity = requirement.requiredQuantity;

    // Get all inventory items for this material, including expired ones, ordered by expiration date
    const inventoryItems = await db.inventory.findMany({
      where: {
        materialId: requirement.materialId,
        quantity: { gt: 0 },
      },
      orderBy: { expiredDate: "asc" }, // Lấy nguyên liệu cũ nhất trước (FIFO)
    });

    if (inventoryItems.length === 0) {
      throw new Error(
        `Không tìm thấy nguyên liệu ${requirement.materialId} trong kho`,
      );
    }

    for (const item of inventoryItems) {
      if (remainingQuantity <= 0) break;

      const currentQuantity = Number(item.quantity);
      const deductAmount = Math.min(currentQuantity, remainingQuantity);

      await db.inventory.update({
        where: {
          materialId_expiredDate: {
            materialId: item.materialId,
            expiredDate: item.expiredDate,
          },
        },
        data: {
          quantity: new Decimal(currentQuantity - deductAmount),
        },
      });

      remainingQuantity -= deductAmount;
    }

    // Kiểm tra nếu vẫn còn remainingQuantity > 0 sau khi đã duyệt hết inventory
    if (remainingQuantity > 0) {
      throw new Error(
        `Không đủ số lượng nguyên liệu ${requirement.materialId} trong kho`,
      );
    }
  }
}
