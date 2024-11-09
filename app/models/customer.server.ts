import type { Customer, CustomerPassword, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/lib/db.server";

export async function getCustomerByPhoneNumber(
  phoneNumber: Customer["phoneNumbers"],
) {
  return prisma.customer.findUnique({ where: { phoneNumbers: phoneNumber } });
}

export async function getAllCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      Orders: true,
    },
  });
}

export async function getCustomerById(
  db: Prisma.TransactionClient,
  id: Customer["id"],
) {
  return db.customer.findUnique({
    where: { id },
    include: {
      Orders: true,
    },
  });
}

export async function getCustomerByPhone(
  phoneNumbers: Customer["phoneNumbers"],
) {
  return prisma.customer.findUnique({ where: { phoneNumbers } });
}

export async function createCustomer(
  customer: Pick<
    Customer,
    "phoneNumbers" | "fullname" | "status" | "avatarUrl"
  >,
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.customer.create({
    data: {
      ...customer,
      Password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteCustomer(id: Customer["id"]) {
  return prisma.customer.delete({ where: { id } });
}

export async function updatePassword(
  db: Prisma.TransactionClient,
  customerId: Customer["id"],
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return db.customerPassword.update({
    where: { customerId },
    data: { hash: hashedPassword },
  });
}

export async function verifyCustomerLogin(
  phoneNumber: Customer["phoneNumbers"],
  password: CustomerPassword["hash"],
) {
  const customerWithPassword = await prisma.customer.findUnique({
    where: { phoneNumbers: phoneNumber },
    include: {
      Password: true,
    },
  });

  if (!customerWithPassword || !customerWithPassword.Password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    customerWithPassword.Password.hash,
  );

  if (!isValid) {
    return null;
  }

  const { Password: _password, ...customerWithoutPassword } =
    customerWithPassword;

  return customerWithoutPassword;
}

export async function updateCustomer(
  prisma: Prisma.TransactionClient,
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt" | "updatedAt">>,
) {
  return prisma.customer.update({
    where: { id },
    data,
  });
}
