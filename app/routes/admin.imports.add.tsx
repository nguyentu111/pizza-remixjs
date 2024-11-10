import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import QueryString from "qs";
import { z } from "zod";
import { AddOrUpdateImportForm } from "~/components/admin/add-or-update-import-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertImportSchema } from "~/lib/schema";
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

export const action = safeAction([
  {
    method: "POST",
    schema: insertImportSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertImportSchema>;

      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateImports,
      ]);

      await createImport({
        status: validatedData.quotationLink ? "WAITING_APPROVAL" : "PENDING",
        provider: { connect: { id: validatedData.providerId } },
        createdBy: { connect: { id: currentUserId } },
        expectedDeliveryDate: validatedData.expectedDeliveryDate
          ? new Date(validatedData.expectedDeliveryDate)
          : undefined,
        materials: validatedData.materials.map((m: any) => ({
          ...m,
          expiredDate: m.expiredDate ? new Date(m.expiredDate) : undefined,
          pricePerUnit: m.pricePerUnit ? Number(m.pricePerUnit) : undefined,
        })),
        quotationLink: validatedData.quotationLink || null,
      });

      return json({ success: true });
    },
  },
]);

export default function AddImportPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
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
    </>
  );
}
