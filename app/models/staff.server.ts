import type { Prisma, Staff, StaffPassword } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/lib/db.server";

export async function getAllStaff() {
  return prisma.staff.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getStaffById(
  db: Prisma.TransactionClient,
  id: Staff["id"],
) {
  return db.staff.findUnique({
    where: { id },
    include: {
      Roles: {
        include: { role: true },
      },
    },
  });
}
export async function getStaffByUsername(username: Staff["username"]) {
  return prisma.staff.findUnique({ where: { username } });
}
// export async function getStaffByStaffname(staffname: Staff[""]) {
//   return prisma.staff.findUnique({ where: { staffname } });
// }
export async function createStaff(
  staff: Pick<
    Staff,
    "fullname" | "phoneNumbers" | "salary" | "username" | "status" | "image"
  > & {
    // status?: StaffStatus;
    // salary: Staff["salary"];
    // phoneNumbers: Staff["phoneNumbers"];
  },
  { password, roleIds }: { password: string; roleIds?: string[] },
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.staff.create({
    data: {
      ...staff,
      Password: {
        create: {
          hash: hashedPassword,
        },
      },
      Roles: roleIds
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

export async function deleteStaffByUsername(username: Staff["username"]) {
  return prisma.staff.delete({ where: { username } });
}
export async function deleteStaff(id: Staff["id"]) {
  return prisma.staff.delete({ where: { id } });
}

export async function verifyLogin(
  username: Staff["username"],
  password: StaffPassword["hash"],
) {
  const staffWithPassword = await prisma.staff.findUnique({
    where: { username },
    include: {
      Password: true,
    },
  });

  if (!staffWithPassword || !staffWithPassword.Password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    staffWithPassword.Password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { Password: _password, ...staffWithoutPassword } = staffWithPassword;

  return staffWithoutPassword;
}

export async function updateStaff(
  prisma: Prisma.TransactionClient,
  id: string,
  data: Partial<Omit<Staff, "id" | "createdAt" | "updatedAt">>,
) {
  return prisma.staff.update({
    where: { id },
    data,
  });
}
export const updateStaffRoles = async (
  prisma: Prisma.TransactionClient,
  staffId: string,
  newRoleIds: string[],
) => {
  await prisma.staffRole.deleteMany({
    where: { staffId },
  });
  await prisma.staffRole.createMany({
    data: newRoleIds.map((roleId) => ({
      staffId,
      roleId,
    })),
  });
};
export async function updatePassword(
  db: Prisma.TransactionClient,
  staffId: Staff["id"],
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return db.staffPassword.update({
    where: { staffId },
    data: { hash: hashedPassword },
  });
}
