import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AddOrUpdateImportForm } from "~/components/admin/add-or-update-import-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { prisma } from "~/lib/db.server";
import { PermissionsEnum } from "~/lib/type";
import { safeAction } from "~/lib/utils";
import { getImportById } from "~/models/import.server";
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
    },
    providers,
    materials,
  });
};

export const action = safeAction([]);

export default function EditImportPage() {
  const { import_ } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
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
    </>
  );
}
