import { Permission } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AddOrUpdateRoleForm } from "~/components/admin/add-or-update-role-form";
import { prisma } from "~/lib/db.server";
import { getAllPermissions } from "~/models/permission.server";
import { getAllRoles } from "~/models/role.server";

export const loader = async () => {
  const roles = await getAllRoles();
  const permissions = await getAllPermissions(prisma);
  return json({ roles, permissions });
};

export default function RoleManagement() {
  const { permissions, roles } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Thêm quyền</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/roles" className="hover:underline">
              Quản lí quyền
            </a>{" "}
            &gt; Thêm quyền
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateRoleForm
          permissions={permissions as unknown as Permission[]}
        />
      </div>
    </>
  );
}
