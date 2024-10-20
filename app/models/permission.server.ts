// app/controllers/permissionController.ts

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new permission
export const createPermission = async (data: {
  name: string;
  description?: string;
}) => {
  return await prisma.permission.create({
    data,
  });
};

// Get all permissions
export const getAllPermissions = async (db: Prisma.TransactionClient) => {
  return await db.permission.findMany();
};

// Get a permission by ID
export const getPermissionById = async (id: string) => {
  return await prisma.permission.findUnique({
    where: { id },
  });
};

// Get a permission by name
export const getPermissionByName = async (name: string) => {
  return await prisma.permission.findUnique({
    where: { name },
  });
};

// Update a permission by ID
export const updatePermission = async (
  id: string,
  data: { name?: string; description?: string },
) => {
  return await prisma.permission.update({
    where: { id },
    data,
  });
};

// Delete a permission by ID
export const deletePermission = async (id: string) => {
  return await prisma.permission.delete({
    where: { id },
  });
};
