// app/controllers/role.controller.ts

import { Permission, Prisma, PrismaClient, Role, Staff } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new role
export const createRole = async (data: {
  name: string;
  description?: string;
  permissionIds?: string[]; // Updated to match the schema
}) => {
  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
  if (data.permissionIds)
    await prisma.rolePermission.createMany({
      data: data.permissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId: permissionId,
      })),
    });
  return role;
};

// Get all roles
export const getAllRoles = async () => {
  return await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// Get a role by ID
export const getRoleById = async (db: Prisma.TransactionClient, id: string) => {
  return await db.role.findUnique({
    where: { id },
    include: { permissions: true },
  });
};

// Update a role by ID
export const updateRole = async (
  id: string,
  data: { name?: string; description?: string },
) => {
  return await prisma.role.update({
    where: { id },
    data,
  });
};

// Delete a role by ID
export const deleteRole = async (id: string) => {
  return await prisma.role.delete({
    where: { id },
  });
};
export const getRoleByName = async (name: string) => {
  return await prisma.role.findUnique({
    where: { name },
  });
};
export const updateRolePermssions = (
  db: Prisma.TransactionClient,
  roleId: Role["id"],
  permissionIds: Permission["id"][],
) => {
  db.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId: { notIn: permissionIds },
    },
  });
  db.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    })),
    skipDuplicates: true, // Skip creating duplicates (already existing RolePermission records)
  });
};
export const getStaffRoles = async (
  db: Prisma.TransactionClient,
  staffId: Staff["id"],
) => {
  return await db.role.findMany({
    where: {
      staffRoles: {
        some: { staffId },
      },
    },
  });
};
