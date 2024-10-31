import type { Prisma, Product } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      Borders: {
        include: { border: true },
      },
      Toppings: {
        include: { topping: true },
      },
      Sizes: {
        include: { size: true },
      },
    },
  });
}

export async function getProductById(
  db: Prisma.TransactionClient,
  id: Product["id"],
) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      Borders: {
        include: { border: true },
      },
      Toppings: {
        include: { topping: true },
      },
      Sizes: {
        include: { size: true },
      },
      Recipes: {
        include: { material: true },
      },
    },
  });
}

export async function getProductBySlug(slug: Product["slug"]) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      Borders: {
        include: { border: true },
      },
      Toppings: {
        include: { topping: true },
      },
      Sizes: {
        include: { size: true },
      },
      Recipes: {
        include: { material: true },
      },
    },
  });
}

export async function createProduct(
  product: Pick<
    Product,
    | "name"
    | "shortDescription"
    | "detailDescription"
    | "slug"
    | "categoryId"
    | "image"
    | "image_mobile"
  >,
  {
    borderIds,
    toppingIds,
    sizes,
    recipes,
  }: {
    borderIds?: string[];
    toppingIds?: string[];
    sizes?: { sizeId: string; price: number }[];
    recipes?: { materialId: string; quantity: number }[];
  },
) {
  return prisma.product.create({
    data: {
      ...product,
      Borders: borderIds
        ? {
            create: borderIds.map((borderId) => ({
              border: { connect: { id: borderId } },
            })),
          }
        : undefined,
      Toppings: toppingIds
        ? {
            create: toppingIds.map((toppingId) => ({
              topping: { connect: { id: toppingId } },
            })),
          }
        : undefined,
      Sizes: sizes
        ? {
            create: sizes.map(({ sizeId, price }) => ({
              size: { connect: { id: sizeId } },
              price,
            })),
          }
        : undefined,
      Recipes: recipes
        ? {
            create: recipes.map(({ materialId, quantity }) => ({
              material: { connect: { id: materialId } },
              quantity,
            })),
          }
        : undefined,
    },
    include: {
      category: true,
      Borders: {
        include: { border: true },
      },
      Toppings: {
        include: { topping: true },
      },
      Sizes: {
        include: { size: true },
      },
      Recipes: {
        include: { material: true },
      },
    },
  });
}

export async function updateProduct(
  id: Product["id"],
  data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
  {
    borderIds,
    toppingIds,
    sizes,
    recipes,
  }: {
    borderIds?: string[];
    toppingIds?: string[];
    sizes?: { sizeId: string; price: number }[];
    recipes?: { materialId: string; quantity: number }[];
  },
) {
  return prisma.$transaction(async (prisma) => {
    // Update main product data
    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
    });

    // Update borders
    if (borderIds !== undefined) {
      await prisma.productBorder.deleteMany({ where: { productId: id } });
      await prisma.productBorder.createMany({
        data: borderIds.map((borderId) => ({ productId: id, borderId })),
      });
    }

    // Update toppings
    if (toppingIds !== undefined) {
      await prisma.productTopping.deleteMany({ where: { productId: id } });
      await prisma.productTopping.createMany({
        data: toppingIds.map((toppingId) => ({ productId: id, toppingId })),
      });
    }
    console.log({ sizes });
    // Update sizes
    if (sizes !== undefined) {
      await prisma.productSize.deleteMany({ where: { productId: id } });
      await prisma.productSize.createMany({
        data: sizes.map(({ sizeId, price }) => ({
          productId: id,
          sizeId,
          price,
        })),
      });
    }

    // Update recipes
    if (recipes !== undefined) {
      await prisma.recipe.deleteMany({ where: { productId: id } });
      await prisma.recipe.createMany({
        data: recipes.map(({ materialId, quantity }) => ({
          productId: id,
          materialId,
          quantity,
        })),
      });
    }

    return getProductById(prisma, id);
  });
}

export async function deleteProduct(id: Product["id"]) {
  return prisma.product.delete({ where: { id } });
}

export async function getProductByCategorySlug(categorySlug: string) {
  return prisma.product.findMany({
    where: {
      category: {
        slug: categorySlug,
      },
    },
    include: {
      category: true,
      Borders: {
        include: { border: true },
      },
      Toppings: {
        include: { topping: true },
      },
      Sizes: {
        include: { size: true },
      },
    },
  });
}

// Add this new function at the end of the file
export async function getRandomProducts(limit: number = 4) {
  return prisma.product.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      Borders: {
        include: { border: true },
      },
      Toppings: {
        include: { topping: true },
      },
      Sizes: {
        include: { size: true },
      },
    },
  });
}

// Add this new function at the end of the file
export async function getBestSellerProducts(limit: number = 4) {
  return prisma.product.findMany({
    take: limit,
    orderBy: {
      OrderDetail: {
        _count: "desc",
      },
    },
    include: {
      category: true,
      Sizes: {
        include: { size: true },
        take: 1,
      },
    },
  });
}

// Thêm function mới để lấy giá của product size
export async function getProductSizePrice(
  db: Prisma.TransactionClient,
  productId: string,
  sizeId: string,
) {
  const productSize = await db.productSize.findFirst({
    where: {
      productId,
      sizeId,
    },
  });
  return productSize?.price || 0;
}

// Thêm function để lấy giá của border
export async function getBorderPrice(
  db: Prisma.TransactionClient,
  borderId: string,
) {
  const border = await db.border.findUnique({
    where: { id: borderId },
  });
  return border?.price || 0;
}

// Thêm function để lấy giá của topping
export async function getToppingPrice(
  db: Prisma.TransactionClient,
  toppingId: string,
) {
  const topping = await db.topping.findUnique({
    where: { id: toppingId },
  });
  return topping?.price || 0;
}
