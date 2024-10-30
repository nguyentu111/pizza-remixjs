import { Permission } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateRoleForm } from "~/components/admin/add-or-update-role-form";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { safeAction } from "~/lib/utils";
import { getAllPermissions } from "~/models/permission.server";
import { createRole, getAllRoles, getRoleByName } from "~/models/role.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

import { ErrorBoundary } from "~/components/shared/error-boudary";
export { ErrorBoundary };
export const loader = async () => {
  const roles = await getAllRoles();
  const permissions = await getAllPermissions(prisma);
  return json({ roles, permissions });
};
export const insertSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  "permissions[]": z.array(z.string(), {
    message: "Vui lòng chọn ít nhất 1 quyền",
  }),
});
export const action = safeAction([
  {
    method: "POST",
    action: async ({ request }, data) => {
      const userId = await requireStaffId(request);
      await requirePermissions(prisma, userId, [PermissionsEnum.AddRoles]);
      const exist = await getRoleByName(data.name);
      if (exist)
        return json(
          { error: "Role with that name already exist.", success: false },
          { status: 400 },
        );

      await createRole({
        name: data.name,
        description: data.description,
        permissionIds: data["permissions[]"],
      });
      return json({
        success: true,
      });
    },
    schema: insertSchema,
  },
]);
export default function RoleManagement() {
  const { permissions, roles } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Thêm vai trò</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/roles" className="hover:underline">
              Quản lí vai trò
            </a>{" "}
            &gt; Thêm vai trò
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
