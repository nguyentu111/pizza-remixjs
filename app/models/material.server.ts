import type { Prisma, Material } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllMaterials() {
  return prisma.material.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getMaterialById(id: Material["id"]) {
  return prisma.material.findUnique({
    where: { id },
  });
}

export async function getMaterialByName(name: Material["name"]) {
  return prisma.material.findUnique({
    where: { name },
  });
}

export async function createMaterial(
  data: Pick<Material, "name" | "unit" | "warningLimits" | "image">,
) {
  return prisma.material.create({
    data,
  });
}

export async function updateMaterial(
  id: Material["id"],
  data: Partial<Pick<Material, "name" | "unit" | "warningLimits" | "image">>,
) {
  return prisma.material.update({
    where: { id },
    data,
  });
}

export async function deleteMaterial(id: Material["id"]) {
  return prisma.material.delete({
    where: { id },
  });
}
