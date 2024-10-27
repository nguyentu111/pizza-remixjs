import type { Prisma, Size } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllSizes() {
  return prisma.size.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getSizeById(id: Size["id"]) {
  return prisma.size.findUnique({
    where: { id },
  });
}

export async function getSizeByName(name: Size["name"]) {
  return prisma.size.findUnique({
    where: { name },
  });
}

export async function createSize(data: Pick<Size, "name" | "image">) {
  return prisma.size.create({
    data,
  });
}

export async function updateSize(
  id: Size["id"],
  data: Partial<Pick<Size, "name" | "image">>,
) {
  return prisma.size.update({
    where: { id },
    data,
  });
}

export async function deleteSize(id: Size["id"]) {
  return prisma.size.delete({
    where: { id },
  });
}
