import { Prisma, PrismaClient, StaffStatus } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";
import { hash } from "bcryptjs";

export async function seedStaff(prisma: Prisma.TransactionClient) {
  console.log("Seeding staff...");

  // Delete existing staff first
  await prisma.staffPassword.deleteMany();
  await prisma.staffRole.deleteMany();
  await prisma.staff.deleteMany();

  // Create basic roles first
  const roles = [
    {
      name: "Admin",
      description: "Quản lý",
    },
    {
      name: "Chef",
      description: "Đầu bếp",
    },
    {
      name: "Shipper",
      description: "Nhân viên giao hàng",
    },
    {
      name: "Accountant",
      description: "Nhân viên kế toán",
    },
  ];

  const createdRoles = await Promise.all(
    roles.map((role) =>
      prisma.role.create({
        data: role,
      }),
    ),
  );

  const staffMembers = [];

  for (let i = 0; i < 20; i++) {
    const staff = {
      username: faker.internet.userName(),
      phoneNumbers: faker.helpers.replaceSymbols("0#########"),
      fullname: faker.person.fullName(),
      image: faker.image.avatar(),
      address: faker.location.streetAddress(),
      salary: faker.number.int({ min: 5000000, max: 15000000 }),
      status: faker.helpers.arrayElement(["on", "banned"]) as StaffStatus,
    };

    const password = await hash("@@aheng", 10);

    // Assign 1-2 random roles to each staff member
    const roleIds = faker.helpers.arrayElements(
      createdRoles.map((role) => role.id),
      faker.number.int({ min: 1, max: 2 }),
    );

    const createdStaff = await prisma.staff.create({
      data: {
        ...staff,
        Password: {
          create: {
            hash: password,
          },
        },
        Roles: {
          create: roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
    });

    staffMembers.push(createdStaff);
  }
  const admin = {
    username: "admin",
    phoneNumbers: faker.helpers.replaceSymbols("0#########"),
    fullname: "Quản lý",
    image:
      "https://res.cloudinary.com/dfrfwlhzd/image/upload/w_200,h_200,c_fit/v1730187765/pizza-app/gpd56llk6d3hxyddtxzn.jpg",
    address: faker.location.streetAddress(),
    salary: faker.number.int({ min: 5000000, max: 15000000 }),
    status: "on" as StaffStatus,
  };

  const password = await hash("@@aheng", 10);

  const createdStaff = await prisma.staff.create({
    data: {
      ...admin,
      Password: {
        create: {
          hash: password,
        },
      },
      Roles: {
        create: {
          roleId: createdRoles.find((role) => role.name === "Admin")!.id,
        },
      },
    },
  });

  staffMembers.push(createdStaff);
  console.log(`✅ Seeded ${staffMembers.length} staff members`);
}
