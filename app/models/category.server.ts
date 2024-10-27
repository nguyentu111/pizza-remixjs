import type { Prisma, Category } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: Category["id"]) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(
  data: Pick<Category, "name" | "image" | "slug">,
) {
  return prisma.category.create({
    data,
  });
}

export async function updateCategory(
  id: Category["id"],
  data: Partial<Pick<Category, "name" | "image" | "slug">>,
) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: Category["id"]) {
  return prisma.category.delete({
    where: { id },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

// New function to check if a category with the given name exists
export async function getCategoryByName(name: string) {
  return prisma.category.findFirst({
    where: { name: { equals: name } },
  });
}

// Add other category-related functions here as needed
