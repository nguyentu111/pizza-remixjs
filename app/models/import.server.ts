import type { Import, ImportMaterial, Prisma } from "@prisma/client";
import { prisma } from "~/lib/db.server";

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

export async function createImport(data: {
  totalAmount: Prisma.Decimal | number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  provider: { connect: { id: string } };
  createdBy?: { connect: { id: string } };
  expectedDeliveryDate?: Date;
  materials: Array<{
    materialId: string;
    expectedQuantity: number;
    qualityStandard?: string;
    expiredDate?: Date;
  }>;
}) {
  return prisma.$transaction(async (tx) => {
    const import_ = await tx.import.create({
      data: {
        totalAmount: data.totalAmount,
        status: data.status,
        provider: data.provider,
        createdBy: data.createdBy,
        expectedDeliveryDate: data.expectedDeliveryDate,
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
      })),
    });

    return import_;
  });
}

export async function updateImport(
  id: Import["id"],
  data: Partial<{
    totalAmount: Prisma.Decimal | number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
    provider: { connect: { id: string } };
    expectedDeliveryDate?: Date;
    materials: Array<{
      materialId: string;
      expectedQuantity: number;
      qualityStandard?: string;
      expiredDate?: Date;
    }>;
  }>,
) {
  return prisma.$transaction(async (tx) => {
    if (data.materials) {
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
        })),
      });
    }

    return tx.import.update({
      where: { id },
      data: {
        totalAmount: data.totalAmount,
        status: data.status,
        provider: data.provider,
        expectedDeliveryDate: data.expectedDeliveryDate,
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
