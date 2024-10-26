// app/controllers/permissionController.ts

import { Permission, Prisma, PrismaClient, Role, Staff } from "@prisma/client";
import { getStaffRoles } from "./role.server";

const prisma = new PrismaClient();

// Create a new permission
export const createPermission = async (data: {
  name: string;
  displayName: string;
  description?: string;
  group: string;
}) => {
  return await prisma.permission.create({
    data,
  });
};

// Get all permissions
export const getAllPermissions = async (db: Prisma.TransactionClient) => {
  return await db.permission.findMany({
    orderBy: { group: "asc" },
  });
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

// export const getPermissionByUserId = async (
//   db: Prisma.TransactionClient,
//   userId: Staff["id"],
// ) => {
//   const userRole = await getStaffRoles(db, userId);
//   return await db.role;
// };
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
export const getRolePermission = async (
  db: Prisma.TransactionClient,
  roleId: Role["id"],
) => {
  return db.permission.findMany({
    where: { roles: { some: { roleId } } },
  });
};

export const getUserPermission = async (
  db: Prisma.TransactionClient,
  staffId: Staff["id"],
) => {
  return await db.permission.findMany({
    where: {
      roles: {
        some: {
          role: {
            staffRoles: {
              some: { staffId }, // Check that the role is linked to the user
            },
          },
        },
      },
    },
    select: {
      name: true, // Only select the permission names
    },
  });
};
