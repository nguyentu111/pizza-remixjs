import { CustomerStatus, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";
import { hash } from "bcryptjs";

export async function seedCustomers(tx: Prisma.TransactionClient) {
  console.log("Seeding customers...");

  const customers = [];

  for (let i = 0; i < 100; i++) {
    const startDate = new Date("2024-01-01");
    const endDate = new Date();

    const customer = {
      id: faker.string.uuid(),
      phoneNumbers: faker.helpers.replaceSymbols("0#########"),
      fullname: faker.person.fullName(),
      status: faker.helpers.arrayElement(["on", "banned"]) as CustomerStatus,
      avatarUrl: faker.image.avatar(),
      createdAt: faker.date.between({ from: startDate, to: endDate }),
      updatedAt: faker.date.between({ from: startDate, to: endDate }),
    };

    const password = await hash("@@aheng", 10);
    customers.push({ customer, password });
  }

  customers.sort(
    (a, b) => a.customer.createdAt.getTime() - b.customer.createdAt.getTime(),
  );

  for (const { customer, password } of customers) {
    await tx.customer.create({
      data: {
        ...customer,
        Password: {
          create: {
            hash: password,
          },
        },
      },
    });
  }

  console.log(`✅ Seeded ${customers.length} customers`);
}
