import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { useModal } from "~/components/providers/modal-provider";
import { prisma } from "~/lib/db.server";
import { insertUserSchema } from "~/lib/schema";
import { ca, safeAction } from "~/lib/utils";
import { getAllPermissions } from "~/models/permission.server";
import { getAllRoles } from "~/models/role.server";
import {
  createUser,
  getAllUser,
  getUserByEmail,
  getUserByUsername,
} from "~/models/user.server";

export const loader = async () => {
  const roles = await getAllRoles();
  const permissions = await getAllPermissions(prisma);
  const users = await getAllUser();
  return json({ roles, permissions, users });
};

// Action for creating and deleting roles
export const action = safeAction([
  {
    method: "POST",
    schema: insertUserSchema,
    action: ca(async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertUserSchema>;
      const exist1 = await getUserByUsername(validatedData.username);
      if (exist1)
        return json(
          { error: "Tên tài khoản đã tồn tại .", success: false },
          { status: 403 },
        );
      const exist2 = await getUserByEmail(validatedData.email);
      if (exist2)
        return json(
          { error: "Email đã tồn tại", success: false },
          { status: 403 },
        );
      await createUser(
        {
          email: validatedData.email,
          fullName: validatedData.fullName,
          username: validatedData.username,
          avatarId: validatedData.avatarId,
          avatarUrl: validatedData.avatarUrl,
          status: validatedData.status ?? "banned",
        },
        { password: validatedData.password, roleIds: validatedData["roles[]"] },
      );
      return json({
        success: true,
      });
    }),
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
