import { ImportStatus, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";

export async function seedImports(tx: Prisma.TransactionClient) {
  console.log("Seeding imports...");

  // Get all materials and providers
  const materials = await tx.material.findMany();
  let providers = await tx.provider.findMany();

  // Get staff members by role
  const accountants = await tx.staff.findMany({
    where: {
      Roles: {
        some: {
          role: {
            name: "Accountant",
          },
        },
      },
    },
  });

  if (!accountants.length) {
    throw new Error(
      "No accountants found. Please seed staff with Accountant role first.",
    );
  }

  // If no providers exist, create some
  if (providers.length === 0) {
    const providerNames = [
      "Công ty TNHH Thực phẩm Việt Nam",
      "Công ty CP Thực phẩm Sạch",
      "Công ty TNHH Hải sản Tươi sống",
      "Công ty TNHH Nông sản Xanh",
      "Công ty CP Thực phẩm Đông lạnh",
    ];

    await tx.provider.createMany({
      data: providerNames.map((name) => ({
        name,
        address: faker.location.streetAddress(),
        image: faker.image.url(),
      })),
    });
    providers = await tx.provider.findMany();
  }

  // Process providers in smaller batches
  const BATCH_SIZE = 2; // Process 2 providers at a time
  for (let i = 0; i < providers.length; i += BATCH_SIZE) {
    const providerBatch = providers.slice(i, i + BATCH_SIZE);

    for (const provider of providerBatch) {
      const importCount = faker.number.int({ min: 10, max: 15 }); // Reduced count

      for (let j = 0; j < importCount; j++) {
        await createImportRecord(tx, provider, materials, accountants);
      }
    }
  }

  // Create fewer additional imports
  const additionalImportCount = faker.number.int({ min: 10, max: 20 }); // Reduced count
  for (let i = 0; i < additionalImportCount; i++) {
    await createAdditionalImport(tx, providers, materials, accountants);
  }

  // Verify material import counts in smaller batches
  const MATERIAL_BATCH_SIZE = 5;
  for (let i = 0; i < materials.length; i += MATERIAL_BATCH_SIZE) {
    const materialBatch = materials.slice(i, i + MATERIAL_BATCH_SIZE);

    for (const material of materialBatch) {
      const importCount = await tx.importMaterial.count({
        where: { materialId: material.id },
      });

      if (importCount < 10) {
        const neededImports = 10 - importCount;
        for (let j = 0; j < neededImports; j++) {
          await createCompletedImportForMaterial(
            tx,
            material,
            providers,
            accountants,
          );
        }
      }
    }
  }

  console.log("✅ Seeded imports and updated inventory");
}

// Helper functions
async function createImportRecord(
  tx: Prisma.TransactionClient,
  provider: any,
  materials: any[],
  accountants: any[],
) {
  const importDate = faker.date.between({
    from: new Date("2024-01-01"),
    to: new Date("2024-12-31"),
  });
  const accountant = faker.helpers.arrayElement(accountants);

  const importRecord = await tx.import.create({
    data: {
      providerId: provider.id,
      status: "COMPLETED",
      quotationLink: faker.helpers.maybe(() => faker.internet.url()),
      expectedDeliveryDate: faker.date.soon({ refDate: importDate }),
      createdById: accountant.id,
      receivedById: accountant.id,
      approvedById: accountant.id,
      approvedAt: faker.date.between({
        from: importDate,
        to: new Date(importDate.getTime() + 24 * 60 * 60 * 1000),
      }),
      totalAmount: "0",
    },
  });

  // Create 2-3 materials per import instead of 3-5
  const selectedMaterials = faker.helpers.arrayElements(
    materials,
    faker.number.int({ min: 2, max: 3 }),
  );

  let totalAmount = 0;
  for (const material of selectedMaterials) {
    const expectedQuantity = faker.number.int({ min: 10, max: 50 }); // Reduced quantity
    const actualGood = faker.number.int({
      min: Math.floor(expectedQuantity * 0.8),
      max: expectedQuantity,
    });
    const actualDefective = expectedQuantity - actualGood;
    const expiredDate = faker.date.future({
      refDate: importDate,
      years: 1,
    });
    const pricePerUnit = faker.number.int({ min: 50000, max: 500000 });

    await tx.importMaterial.create({
      data: {
        importId: importRecord.id,
        materialId: material.id,
        expectedQuantity,
        qualityStandard: faker.lorem.sentence(),
        actualGood,
        actualDefective,
        expiredDate,
        pricePerUnit,
      },
    });

    totalAmount += pricePerUnit * expectedQuantity;

    await updateInventory(tx, material.id, actualGood, expiredDate);
  }

  await tx.import.update({
    where: { id: importRecord.id },
    data: { totalAmount: totalAmount.toString() },
  });
}

async function createCompletedImportForMaterial(
  tx: Prisma.TransactionClient,
  material: any,
  providers: any[],
  accountants: any[],
) {
  const importDate = faker.date.between({
    from: new Date("2024-01-01"),
    to: new Date("2024-12-31"),
  });
  const accountant = faker.helpers.arrayElement(accountants);
  const provider = faker.helpers.arrayElement(providers);

  const importRecord = await tx.import.create({
    data: {
      providerId: provider.id,
      status: "COMPLETED",
      quotationLink: faker.helpers.maybe(() => faker.internet.url()),
      expectedDeliveryDate: faker.date.soon({ refDate: importDate }),
      createdById: accountant.id,
      receivedById: accountant.id,
      approvedById: accountant.id,
      approvedAt: faker.date.between({
        from: importDate,
        to: new Date(importDate.getTime() + 24 * 60 * 60 * 1000),
      }),
      totalAmount: "0",
    },
  });

  const expectedQuantity = faker.number.int({ min: 10, max: 100 });
  const actualGood = faker.number.int({
    min: Math.floor(expectedQuantity * 0.8),
    max: expectedQuantity,
  });
  const actualDefective = expectedQuantity - actualGood;
  const expiredDate = faker.date.future({
    refDate: importDate,
    years: 1,
  });
  const pricePerUnit = faker.number.int({ min: 50000, max: 500000 });

  await tx.importMaterial.create({
    data: {
      importId: importRecord.id,
      materialId: material.id,
      expectedQuantity,
      qualityStandard: faker.lorem.sentence(),
      actualGood,
      actualDefective,
      expiredDate,
      pricePerUnit,
    },
  });

  // Update inventory
  const existingInventory = await tx.inventory.findUnique({
    where: {
      materialId_expiredDate: {
        materialId: material.id,
        expiredDate,
      },
    },
  });

  if (existingInventory) {
    await tx.inventory.update({
      where: {
        materialId_expiredDate: {
          materialId: material.id,
          expiredDate,
        },
      },
      data: {
        quantity: {
          increment: actualGood,
        },
      },
    });
  } else {
    await tx.inventory.create({
      data: {
        materialId: material.id,
        quantity: actualGood,
        expiredDate,
      },
    });
  }

  // Update import total amount
  await tx.import.update({
    where: { id: importRecord.id },
    data: { totalAmount: (pricePerUnit * expectedQuantity).toString() },
  });
}

async function updateInventory(
  tx: Prisma.TransactionClient,
  materialId: string,
  quantity: number,
  expiredDate: Date,
) {
  const existingInventory = await tx.inventory.findUnique({
    where: {
      materialId_expiredDate: {
        materialId,
        expiredDate,
      },
    },
  });

  if (existingInventory) {
    await tx.inventory.update({
      where: {
        materialId_expiredDate: {
          materialId,
          expiredDate,
        },
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  } else {
    await tx.inventory.create({
      data: {
        materialId,
        quantity,
        expiredDate,
      },
    });
  }
}

// Thêm hàm createAdditionalImport
async function createAdditionalImport(
  tx: Prisma.TransactionClient,
  providers: any[],
  materials: any[],
  accountants: any[],
) {
  const provider = faker.helpers.arrayElement(providers);
  const importDate = faker.date.between({
    from: new Date("2024-01-01"),
    to: new Date("2024-12-31"),
  });
  const status = faker.helpers.arrayElement([
    "PENDING",
    "WAITING_APPROVAL",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
  ] as ImportStatus[]);
  const accountant = faker.helpers.arrayElement(accountants);

  let importData: any = {
    providerId: provider.id,
    status,
    quotationLink: faker.helpers.maybe(() => faker.internet.url()),
    expectedDeliveryDate: faker.date.soon({ refDate: importDate }),
    createdById: accountant.id,
    totalAmount: "0",
  };

  // Add status-specific data
  switch (status) {
    case "APPROVED":
      importData = {
        ...importData,
        approvedById: accountant.id,
        approvedAt: faker.date.between({
          from: importDate,
          to: new Date(importDate.getTime() + 24 * 60 * 60 * 1000),
        }),
      };
      break;
    case "REJECTED":
    case "CANCELLED":
      importData = {
        ...importData,
        cancledReason: faker.lorem.sentence(),
      };
      break;
  }

  const importRecord = await tx.import.create({
    data: {
      ...importData,
      ImportMaterials: {
        create: faker.helpers
          .arrayElements(materials, faker.number.int({ min: 1, max: 5 }))
          .map((material) => ({
            materialId: material.id,
            expectedQuantity: faker.number.int({ min: 10, max: 100 }),
            qualityStandard: faker.lorem.sentence(),
            actualGood: 0,
            actualDefective: 0,
            expiredDate: faker.date.future({ refDate: importDate }),
            pricePerUnit: faker.number.int({ min: 50000, max: 500000 }),
          })),
      },
    },
    include: {
      ImportMaterials: true,
    },
  });

  // Update total amount
  const totalAmount = importRecord.ImportMaterials.reduce(
    (sum, material) =>
      sum + Number(material.pricePerUnit) * Number(material.expectedQuantity),
    0,
  );

  await tx.import.update({
    where: { id: importRecord.id },
    data: { totalAmount: totalAmount.toString() },
  });

  return importRecord;
}
