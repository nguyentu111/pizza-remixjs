import { Permission, RolePermission, Role } from "@prisma/client";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateRoleForm } from "~/components/admin/add-or-update-role-form";
import { prisma } from "~/lib/db.server";
import { roleSchema } from "~/lib/schema";
import { ca, safeAction } from "~/lib/utils";
import { getAllPermissions } from "~/models/permission.server";
import { deleteRole, getRoleById } from "~/models/role.server";
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
    action: ca(async ({ request, params }) => {
      const id = params.roleId as string;
      if (!id) return json({ success: false, error: "missing id." }, 400);
      await deleteRole(id);
      return json({ success: true });
    }),
  },
  {
    method: "PUT",
    schema: roleSchema,
    action: ca(async ({ request, params }, data) => {
      const id = params.roleId as string;
      if (!id) return json({ success: false, error: "missing id." }, 400);
      await prisma.$transaction(async (db) => {
        const role = await getRoleById(db, id);
        if (!role)
          return json(
            {
              error: "Không tìm thấy role",
              success: false,
            },
            { status: 404 },
          );
        const validatedData = data as z.infer<typeof roleSchema>;
        const permissionIds = validatedData["permissions[]"];

        await db.role.update({
          where: { id },
          data: {
            name: validatedData.name,
            description: validatedData.description,
          },
        });
        if (permissionIds) {
          await db.rolePermission.deleteMany({ where: { roleId: role.id } });

          await db.rolePermission.createMany({
            data: permissionIds.map((pId) => ({
              permissionId: pId,
              roleId: role.id,
            })),
          });
        }
      });
      return json({ success: true });
    }),
  },
]);
export default function UpdateRolePage() {
  const { permissions, role } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Sửa quyền</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/roles" className="hover:underline">
              Quản lí quyền
            </a>{" "}
            &gt; Sửa quyền
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
