import { ErrorBoundary } from "~/components/shared/error-boudary";

import { json, LoaderFunctionArgs } from "@remix-run/node";
import { RoleTable } from "~/components/admin/role-table";
import { prisma } from "~/lib/db.server";
import { PermissionsEnum } from "~/lib/type";
import { getAllRoles } from "~/models/role.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireStaffId(request);
  await requirePermissions(prisma, userId, [PermissionsEnum.ViewRoles]);
  const roles = await getAllRoles();
  return json({ roles });
};

export default function RoleManagement() {
  const { roles } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lí vai trò</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lí vai trò
          </nav>
        </div>
      </div>
      <RoleTable roles={roles as any} />
    </>
  );
}

export { ErrorBoundary };
