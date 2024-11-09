import type {
  Import,
  ImportMaterial,
  ImportStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "~/lib/db.server";
import { Decimal } from "@prisma/client/runtime/library";

export type ImportWithDetails = Import & {
  provider: { name: string };
  createdBy?: { fullname: string } | null;
  receivedBy?: { fullname: string } | null;
  ImportMaterials: (ImportMaterial & {
    Material: { name: string; unit: string };
  })[];
};

export async function getAllImports() {
  return prisma.import.findMany({
    include: {
      provider: {
        select: { name: true },
      },
      createdBy: {
        select: { fullname: true },
      },
      receivedBy: {
        select: { fullname: true },
      },
      ImportMaterials: {
        include: {
          Material: {
            select: { name: true, unit: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImportById(id: Import["id"]) {
  return prisma.import.findUnique({
    where: { id },
    include: {
      provider: true,
      ImportMaterials: {
        include: {
          Material: true,
        },
      },
    },
  });
}

export async function calculateTotalAmount(
  materials: Array<{
    expectedQuantity: number;
    pricePerUnit?: number | null;
  }>,
) {
  return materials.reduce((total, material) => {
    return total + (material.pricePerUnit || 0) * material.expectedQuantity;
  }, 0);
}

export async function createImport(data: {
  status:
    | "PENDING"
    | "WAITING_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED";
  provider: { connect: { id: string } };
  createdBy?: { connect: { id: string } };
  expectedDeliveryDate?: Date;
  quotationLink: string | null;
  materials: Array<{
    materialId: string;
    expectedQuantity: number;
    qualityStandard?: string;
    expiredDate?: Date;
    pricePerUnit?: number;
  }>;
}) {
  return prisma.$transaction(async (tx) => {
    const totalAmount = await calculateTotalAmount(data.materials);

    const import_ = await tx.import.create({
      data: {
        status: data.status,
        provider: data.provider,
        createdBy: data.createdBy,
        quotationLink: data.quotationLink,
        expectedDeliveryDate: data.expectedDeliveryDate,
        totalAmount,
      },
    });

    await tx.importMaterial.createMany({
      data: data.materials.map((material) => ({
        importId: import_.id,
        materialId: material.materialId,
        expectedQuantity: material.expectedQuantity,
        qualityStandard: material.qualityStandard,
        actualGood: 0,
        actualDefective: 0,
        expiredDate: material.expiredDate,
        pricePerUnit: material.pricePerUnit,
      })),
    });

    return import_;
  });
}

export async function updateImport(
  id: Import["id"],
  data: Partial<{
    status: ImportStatus;
    provider: { connect: { id: string } };
    expectedDeliveryDate?: Date;
    quotationLink: string | null;
    materials: Array<{
      materialId: string;
      expectedQuantity: number;
      qualityStandard?: string;
      expiredDate?: Date;
      pricePerUnit?: number | null;
    }>;
  }>,
) {
  return prisma.$transaction(async (tx) => {
    let totalAmount: number | undefined;

    if (data.materials) {
      totalAmount = await calculateTotalAmount(data.materials);

      await tx.importMaterial.deleteMany({
        where: { importId: id },
      });

      await tx.importMaterial.createMany({
        data: data.materials.map((material) => ({
          importId: id,
          materialId: material.materialId,
          expectedQuantity: material.expectedQuantity,
          qualityStandard: material.qualityStandard,
          actualGood: 0,
          actualDefective: 0,
          expiredDate: material.expiredDate,
          pricePerUnit: material.pricePerUnit,
        })),
      });
    }

    return tx.import.update({
      where: { id },
      data: {
        ...(totalAmount !== undefined && { totalAmount }),
        status: data.status,
        provider: data.provider,
        expectedDeliveryDate: data.expectedDeliveryDate,
        quotationLink: data.quotationLink,
      },
    });
  });
}

export async function deleteImport(id: Import["id"]) {
  return prisma.$transaction(async (tx) => {
    await tx.importMaterial.deleteMany({
      where: { importId: id },
    });
    return tx.import.delete({
      where: { id },
    });
  });
}

export async function getImportWithApprovalDetails(id: Import["id"]) {
  return prisma.import.findUnique({
    where: { id },
    include: {
      provider: true,
      createdBy: {
        select: {
          fullname: true,
        },
      },
      approvedBy: {
        select: {
          fullname: true,
        },
      },
      ImportMaterials: {
        include: {
          Material: true,
        },
      },
    },
  });
}

export async function getMaterialPriceHistory(
  materialId: string,
  beforeDate: Date,
) {
  return prisma.importMaterial.findMany({
    where: {
      materialId,
      Import: {
        status: { in: ["COMPLETED", "APPROVED"] },
        createdAt: {
          lt: beforeDate,
        },
      },
    },
    include: {
      Import: {
        select: {
          createdAt: true,
        },
      },
    },
    orderBy: {
      Import: {
        createdAt: "desc",
      },
    },
    take: 3,
  });
}

export async function approveImport(
  importId: string,
  data: {
    status: "APPROVED" | "REJECTED";
    approvedById: string;
    cancledReason?: string;
  },
) {
  return prisma.import.update({
    where: { id: importId },
    data: {
      status: data.status,
      approvedBy: { connect: { id: data.approvedById } },
      cancledReason: data.cancledReason,
    },
  });
}
export async function updateImportReceived(
  id: Import["id"],
  data: {
    receivedById: string;
    materials: Array<{
      materialId: string;
      actualGood: number;
      actualDefective: number;
      expiredDate?: Date;
      pricePerUnit?: number;
    }>;
  },
) {
  return prisma.$transaction(async (tx) => {
    // Update each material and inventory
    await Promise.all(
      data.materials.map(async (material) => {
        // Update import material
        await tx.importMaterial.update({
          where: {
            importId_materialId: {
              importId: id,
              materialId: material.materialId,
            },
          },
          data: {
            actualGood: material.actualGood,
            actualDefective: material.actualDefective,
            expiredDate: material.expiredDate,
            pricePerUnit: material.pricePerUnit,
          },
        });

        if (material.actualGood > 0 && material.expiredDate) {
          // Update or create inventory record
          await tx.inventory.upsert({
            where: {
              materialId_expiredDate: {
                materialId: material.materialId,
                expiredDate: material.expiredDate,
              },
            },
            create: {
              materialId: material.materialId,
              quantity: new Decimal(material.actualGood),
              expiredDate: material.expiredDate,
            },
            update: {
              quantity: {
                increment: material.actualGood,
              },
            },
          });
        }
      }),
    );

    // Update import status and receiver
    return tx.import.update({
      where: { id },
      data: {
        status: "COMPLETED",
        receivedBy: { connect: { id: data.receivedById } },
      },
    });
  });
}
