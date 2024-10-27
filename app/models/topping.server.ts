import type { Prisma, Topping } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllToppings() {
  return prisma.topping.findMany({
    orderBy: { name: "asc" },
  });
}
export async function getAllToppingWithMaterial() {
  return prisma.topping.findMany({
    include: { Material: true },
    orderBy: { name: "asc" },
  });
}
export async function getToppingById(id: Topping["id"]) {
  return prisma.topping.findUnique({
    where: { id },
  });
}

export async function getToppingByName(name: Topping["name"]) {
  return prisma.topping.findUnique({
    where: { name },
  });
}

export async function createTopping(
  data: Pick<Topping, "name" | "price" | "materialId" | "image">,
) {
  return prisma.topping.create({
    data,
  });
}

export async function updateTopping(
  id: Topping["id"],
  data: Partial<Pick<Topping, "name" | "price" | "materialId" | "image">>,
) {
  return prisma.topping.update({
    where: { id },
    data,
  });
}

export async function deleteTopping(id: Topping["id"]) {
  return prisma.topping.delete({
    where: { id },
  });
}
