import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useModal } from "~/components/providers/modal-provider";
import { prisma } from "~/lib/db.server";
import { getAllPermissions } from "~/models/permission.server";
import { getAllRoles } from "~/models/role.server";
import { getAllStaff } from "~/models/staff.server";

export const loader = async () => {
  const roles = await getAllRoles();
  const permissions = await getAllPermissions(prisma);
  const users = await getAllStaff();
  return json({ roles, permissions, users });
};

// Action for creating and deleting roles
export default function UserManagement() {
  const { users, roles } = useLoaderData<typeof loader>();
  const { setOpen } = useModal();
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
