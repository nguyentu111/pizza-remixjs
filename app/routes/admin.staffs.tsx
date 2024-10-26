import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { useModal } from "~/components/providers/modal-provider";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertStaffSchema } from "~/lib/schema";
import { ca, safeAction } from "~/lib/utils";
import { getAllPermissions } from "~/models/permission.server";
import { getAllRoles } from "~/models/role.server";
import {
  createStaff,
  getAllStaff,
  getStaffByUsername,
} from "~/models/staff.server";
import { requireStaff, requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export const loader = async () => {
  const roles = await getAllRoles();
  const permissions = await getAllPermissions(prisma);
  const users = await getAllStaff();
  return json({ roles, permissions, users });
};

// Action for creating and deleting roles
export const action = safeAction([
  {
    method: "POST",
    schema: insertStaffSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertStaffSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateUsers,
      ]);
      const exist1 = await getStaffByUsername(validatedData.username);
      if (exist1)
        return json(
          { error: "Tên tài khoản đã tồn tại .", success: false },
          { status: 403 },
        );

      await createStaff(
        {
          fullname: validatedData.fullname,
          username: validatedData.username,
          image: validatedData.image ?? null,
          status: validatedData.status ?? "banned",
          phoneNumbers: validatedData.phoneNumbers,
          salary: validatedData.salary ?? null,
        },
        { password: validatedData.password, roleIds: validatedData["roles[]"] },
      );
      return json({
        success: true,
      });
    },
  },
]);

export default function UserManagement() {
  const { users, roles } = useLoaderData<typeof loader>();
  const { setOpen } = useModal();
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
