import type { Prisma, Provider } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllProviders() {
  return prisma.provider.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getProviderById(id: Provider["id"]) {
  return prisma.provider.findUnique({
    where: { id },
  });
}

export async function getProviderByName(name: Provider["name"]) {
  return prisma.provider.findFirst({
    where: { name },
  });
}

export async function createProvider(
  data: Pick<Provider, "name" | "address" | "image">,
) {
  return prisma.provider.create({
    data,
  });
}

export async function updateProvider(
  id: Provider["id"],
  data: Partial<Pick<Provider, "name" | "address" | "image">>,
) {
  return prisma.provider.update({
    where: { id },
    data,
  });
}

export async function deleteProvider(id: Provider["id"]) {
  return prisma.provider.delete({
    where: { id },
  });
}
