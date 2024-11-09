import { prisma } from "~/lib/db.server";

export async function getInventoryStats() {
  const imports = await prisma.import.findMany({
    where: {
      status: "COMPLETED",
    },
    include: {
      provider: true,
      ImportMaterials: {
        include: {
          Material: true,
        },
      },
    },
  });

  const providers = await prisma.provider.findMany();

  // Calculate provider statistics
  const providerStats = await Promise.all(
    providers.map(async (provider) => {
      const providerImports = imports.filter(
        (imp) => imp.providerId === provider.id,
      );

      const totalImports = providerImports.length;

      // Calculate quality rate
      let totalGood = 0;
      let totalQuantity = 0;
      providerImports.forEach((imp) => {
        imp.ImportMaterials.forEach((material) => {
          totalGood += Number(material.actualGood || 0);
          totalQuantity +=
            Number(material.actualGood || 0) +
            Number(material.actualDefective || 0);
        });
      });
      const qualityRate =
        totalQuantity > 0 ? (totalGood / totalQuantity) * 100 : 0;

      // Calculate material statistics
      const materialStats = new Map<
        string,
        { materialName: string; quantity: number; unit: string }
      >();

      providerImports.forEach((imp) => {
        imp.ImportMaterials.forEach((material) => {
          const existing = materialStats.get(material.materialId);
          if (existing) {
            existing.quantity += Number(material.actualGood || 0);
          } else {
            materialStats.set(material.materialId, {
              materialName: material.Material.name,
              quantity: Number(material.actualGood || 0),
              unit: material.Material.unit,
            });
          }
        });
      });

      return {
        providerName: provider.name,
        totalImports,
        totalMaterials: materialStats.size,
        qualityRate,
        materialStats: Array.from(materialStats.values()),
      };
    }),
  );

  // Calculate overall statistics
  const totalImports = imports.length;
  const totalMaterials = await prisma.material.count();
  const averageQualityRate =
    providerStats.length > 0
      ? providerStats.reduce((sum, stat) => sum + stat.qualityRate, 0) /
        providerStats.length
      : 0;

  return {
    providers: providerStats,
    totalImports,
    totalMaterials,
    averageQualityRate,
  };
}
