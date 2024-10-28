import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateImportForm } from "~/components/admin/add-or-update-import-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { safeAction } from "~/lib/utils";
import { getImportById, updateImport } from "~/models/import.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.UpdateImports]);

  const importId = params.importId;
  if (!importId) {
    throw new Response("Not Found", { status: 404 });
  }

  const import_ = await getImportById(importId);
  if (!import_) {
    throw new Response("Not Found", { status: 404 });
  }

  const [providers, materials] = await Promise.all([
    prisma.provider.findMany(),
    prisma.material.findMany(),
  ]);

  return json({
    import_: {
      ...import_,
      totalAmount: import_.totalAmount.toString(),
    },
    providers,
    materials,
  });
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
    method: "PUT",
    schema,
    action: async ({ request, params }, data) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateImports,
      ]);

      const importId = params.importId;
      if (!importId) {
        return json(
          { error: "Import ID is required", success: false },
          { status: 400 },
        );
      }

      const totalAmount = data.materials.reduce(
        (acc: number, curr: { expectedQuantity: number }) =>
          acc + curr.expectedQuantity,
        0,
      );

      await updateImport(importId, {
        totalAmount,
        provider: { connect: { id: data.providerId } },
        expectedDeliveryDate: data.expectedDeliveryDate
          ? new Date(data.expectedDeliveryDate)
          : undefined,
        materials: data.materials.map(
          (m: {
            materialId: string;
            expectedQuantity: number;
            qualityStandard?: string;
            expiredDate?: string;
          }) => ({
            materialId: m.materialId,
            expectedQuantity: m.expectedQuantity,
            qualityStandard: m.qualityStandard,
            expiredDate: m.expiredDate ? new Date(m.expiredDate) : undefined,
          }),
        ),
      });

      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteImports,
      ]);

      const importId = params.importId;
      if (!importId) {
        return json(
          { error: "Import ID is required", success: false },
          { status: 400 },
        );
      }

      await prisma.import.delete({
        where: { id: importId },
      });

      return json({ success: true });
    },
  },
]);

export default function EditImportPage() {
  const { import_, providers, materials } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật phiếu nhập</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/imports" className="hover:underline">
              Quản lý phiếu nhập
            </a>{" "}
            &gt; Cập nhật phiếu nhập
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateImportForm import_={import_ as any} />
      </div>
    </div>
  );
}
