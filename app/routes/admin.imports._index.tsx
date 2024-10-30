import { Import } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ImportTable } from "~/components/admin/import-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { getAllImports, ImportWithDetails } from "~/models/import.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { safeAction } from "~/lib/utils";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewImports]);
  const imports = await getAllImports();

  // Convert Decimal to string to avoid serialization issues
  const serializedImports = imports.map((imp) => ({
    ...imp,
  }));

  return {
    imports: serializedImports,
  };
};

export default function ImportManageHome() {
  const { imports } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Quản lý phiếu nhập</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý phiếu nhập
          </nav>
        </div>
      </div>
      <ImportTable imports={imports as unknown as any} />
    </div>
  );
}
