import type { Prisma, Border } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllBorders() {
  return prisma.border.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getBorderById(id: Border["id"]) {
  return prisma.border.findUnique({
    where: { id },
  });
}

export async function getBorderByName(name: Border["name"]) {
  return prisma.border.findUnique({
    where: { name },
  });
}

export async function createBorder(
  data: Pick<Border, "name" | "price" | "image">,
) {
  return prisma.border.create({
    data,
  });
}

export async function updateBorder(
  id: Border["id"],
  data: Partial<Pick<Border, "name" | "price" | "image">>,
) {
  return prisma.border.update({
    where: { id },
    data,
  });
}

export async function deleteBorder(id: Border["id"]) {
  return prisma.border.delete({
    where: { id },
  });
}
