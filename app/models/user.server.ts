import type {
  Password,
  Prisma,
  PrismaClient,
  Role,
  User,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/lib/db.server";

export type { User } from "@prisma/client";

export async function getAllUser() {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getUserById(
  db: Prisma.TransactionClient,
  id: User["id"],
) {
  return db.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });
}
export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}
export async function getUserByUsername(username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}
export async function createUser(
  user: Pick<User, "email" | "fullName" | "username"> & {
    status?: UserStatus;
    avatarId?: string;
    avatarUrl?: string;
  },
  { password, roleIds }: { password: string; roleIds?: string[] },
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      ...user,
      Password: {
        create: {
          hash: hashedPassword,
        },
      },
      roles: roleIds
        ? {
            create: roleIds.map((roleId) => ({
              role: {
                connect: { id: roleId },
              },
            })),
          }
        : undefined,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}
export async function deleteUser(id: User["id"]) {
  return prisma.user.delete({ where: { id } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      Password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.Password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.Password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { Password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function updateUser(
  prisma: Prisma.TransactionClient,
  id: string,
  data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}
export const updateUserRoles = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  newRoleIds: string[],
) => {
  await prisma.userRole.deleteMany({
    where: { userId },
  });
  await prisma.userRole.createMany({
    data: newRoleIds.map((roleId) => ({
      userId,
      roleId,
    })),
  });
};
export async function updatePassword(
  db: Prisma.TransactionClient,
  userId: User["id"],
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return db.password.update({
    where: { userId },
    data: { hash: hashedPassword },
  });
}
