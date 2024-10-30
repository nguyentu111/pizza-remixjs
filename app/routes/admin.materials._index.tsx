import { Material } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MaterialTable } from "~/components/admin/material-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { prisma } from "~/lib/db.server";
import { PermissionsEnum } from "~/lib/type";
import { getAllMaterials } from "~/models/material.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewMaterials]);
  return {
    materials: await getAllMaterials(),
  };
};

export default function MaterialManageHome() {
  const { materials } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nguyên liệu</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý nguyên liệu
          </nav>
        </div>
      </div>
      <MaterialTable materials={materials as unknown as Material[]} />
    </div>
  );
}
