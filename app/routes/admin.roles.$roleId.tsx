import { Permission, RolePermission, Role } from "@prisma/client";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateRoleForm } from "~/components/admin/add-or-update-role-form";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { roleSchema } from "~/lib/schema";
import { ca, safeAction } from "~/lib/utils";
import { getAllPermissions } from "~/models/permission.server";
import { deleteRole, getRoleById } from "~/models/role.server";
import { requireStaff, requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { ErrorBoundary } from "~/components/shared/error-boudary";

export { ErrorBoundary };
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const id = params.roleId as string;
  const role = await getRoleById(prisma, id);
  if (!role) return redirect("/notfound");
  const permissions = await getAllPermissions(prisma);
  return {
    role,
    permissions,
  };
};

export const action = safeAction([
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const userId = await requireStaffId(request);
      await requirePermissions(prisma, userId, [PermissionsEnum.DeleteRoles]);
      const id = params.roleId as string;
      if (!id) return json({ success: false, error: "missing id." }, 400);
      await deleteRole(id);
      return json({ success: true });
    },
  },
  {
    method: "PUT",
    schema: roleSchema,
    action: async ({ request, params }, data) => {
      const userId = await requireStaffId(request);
      await requirePermissions(prisma, userId, [PermissionsEnum.UpdateRoles]);
      const id = params.roleId as string;
      if (!id) return json({ success: false, error: "missing id." }, 400);

      await prisma.$transaction(async (db) => {
        const role = await getRoleById(db, id);
        if (!role) {
          return json(
            {
              error: "Không tìm thấy role",
              success: false,
            },
            { status: 404 },
          );
        }

        const validatedData = data as z.infer<typeof roleSchema>;
        const newPermissionIds = validatedData["permissions[]"] || [];

        // Update role name and description
        await db.role.update({
          where: { id },
          data: {
            name: validatedData.name,
            description: validatedData.description,
          },
        });

        // Get existing permissions
        const existingPermissions = await db.rolePermission.findMany({
          where: { roleId: role.id },
          select: { permissionId: true },
        });
        const existingPermissionIds = existingPermissions.map(
          (p) => p.permissionId,
        );

        // Determine permissions to add and remove
        const permissionsToAdd = newPermissionIds.filter(
          (id) => !existingPermissionIds.includes(id),
        );
        const permissionsToRemove = existingPermissionIds.filter(
          (id) => !newPermissionIds.includes(id),
        );

        // Remove permissions
        if (permissionsToRemove.length > 0) {
          await db.rolePermission.deleteMany({
            where: {
              roleId: role.id,
              permissionId: { in: permissionsToRemove },
            },
          });
        }

        // Add new permissions
        if (permissionsToAdd.length > 0) {
          await db.rolePermission.createMany({
            data: permissionsToAdd.map((permissionId) => ({
              roleId: role.id,
              permissionId,
            })),
          });
        }
      });

      return json({ success: true });
    },
  },
]);
export default function UpdateRolePage() {
  const { permissions, role } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Sửa vai trò</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/roles" className="hover:underline">
              Quản lí vai trò
            </a>{" "}
            &gt; Sửa vai trò
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateRoleForm
          role={
            role as unknown as Role & { permissions: RolePermission[] } & {
              id?: Role["id"];
            }
          }
          permissions={permissions as unknown as Permission[]}
        />
      </div>
    </>
  );
}
