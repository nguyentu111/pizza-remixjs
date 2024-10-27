import { Role } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateStaffForm } from "~/components/admin/add-or-update-staff-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertStaffSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { getAllRoles } from "~/models/role.server";
import { createStaff, getStaffByUsername } from "~/models/staff.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async () => {
  return { roles: await getAllRoles() };
};

export const action = safeAction([
  {
    method: "POST",
    schema: insertStaffSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertStaffSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateStaffs,
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

export default function AddUserPage() {
  const { roles } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm nhân viên</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/staffs" className="hover:underline">
              Quản lí nhân viên
            </a>{" "}
            &gt; Thêm nhân viên
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateStaffForm roles={roles as unknown as Role[]} />;
      </div>
    </>
  );
}
