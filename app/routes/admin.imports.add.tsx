import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { AddOrUpdateImportForm } from "~/components/admin/add-or-update-import-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { safeAction } from "~/lib/utils";
import { createImport } from "~/models/import.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.CreateImports]);

  const [providers, materials] = await Promise.all([
    prisma.provider.findMany(),
    prisma.material.findMany(),
  ]);

  return json({ providers, materials });
};

const schema = z.object({
  providerId: z.string(),
  expectedDeliveryDate: z.string().optional(),
  materials: z.array(
    z.object({
      materialId: z.string(),
      expectedQuantity: z.number(),
      qualityStandard: z.string().optional(),
      expiredDate: z.string().optional(),
    }),
  ),
});

export const action = safeAction([
  {
    method: "POST",
    schema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof schema>;

      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateImports,
      ]);

      const totalAmount = validatedData.materials.reduce(
        (acc: number, curr: any) => acc + curr.expectedQuantity,
        0,
      );

      await createImport({
        totalAmount,
        status: "PENDING",
        provider: { connect: { id: validatedData.providerId } },
        createdBy: { connect: { id: currentUserId } },
        expectedDeliveryDate: validatedData.expectedDeliveryDate
          ? new Date(validatedData.expectedDeliveryDate)
          : undefined,
        materials: validatedData.materials.map((m: any) => ({
          ...m,
          expiredDate: m.expiredDate ? new Date(m.expiredDate) : undefined,
        })),
      });

      return json({ success: true });
    },
  },
]);

export default function AddImportPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Thêm phiếu nhập</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/imports" className="hover:underline">
              Quản lý phiếu nhập
            </a>{" "}
            &gt; Thêm phiếu nhập
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateImportForm />
      </div>
    </div>
  );
}
