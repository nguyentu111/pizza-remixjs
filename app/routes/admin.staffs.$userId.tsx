import { Role, Staff, StaffRole } from "@prisma/client";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateStaffForm } from "~/components/admin/add-or-update-staff-form";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { updateStaffSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { getAllRoles, getStaffRoles } from "~/models/role.server";
import {
  deleteStaff,
  getStaffById,
  updatePassword,
  updateStaff,
  updateStaffRoles,
} from "~/models/staff.server";
import { requireStaff } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import * as _ from "lodash";
import { CustomHttpError, ERROR_NAME } from "~/lib/error";
import { ErrorBoundary } from "~/components/shared/error-boudary";

export { ErrorBoundary };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const id = params.userId;
  const staff = await getStaffById(prisma, id as string);
  console.log({ staff });
  if (!staff) return redirect("/notfound");
  return {
    roles: await getAllRoles(),
    staff,
  };
};

export const action = safeAction([
  {
    method: "PUT",
    schema: updateStaffSchema, // Add the schema for validation
    action: async ({ request, params }, data) => {
      const currentUser = await requireStaff(prisma, request);
      // await requirePermissions(prisma, currentUser.id, [
      //   PermissionsEnum.UpdateUSers,
      // ]);
      const validatedData = data as z.infer<typeof updateStaffSchema>;

      const id = params.userId as string | undefined;
      if (!id)
        return json(
          { success: false, error: "Missing staff ID." },
          { status: 400 },
        );

      return await prisma.$transaction(async (db) => {
        const user = await getStaffById(db, id);
        if (!user)
          return json(
            { success: false, error: "Không tìm thấy staff." },
            { status: 404 },
          );

        if (
          currentUser.id === user.id &&
          (validatedData?.status === undefined ||
            validatedData?.status === "banned")
        ) {
          return json(
            { success: false, error: "Không thể tự khóa tài khoản bản thân." },
            { status: 400 },
          );
        }
        if (!validatedData.status || validatedData.status === "banned") {
          await requirePermissions(db, currentUser.id, [
            PermissionsEnum.BanStaffs,
          ]);
        }

        await updateStaff(db, id, {
          fullname: validatedData.fullname,
          username: validatedData.username,
          status: validatedData.status ?? "banned",
          image: validatedData.image,
          address: validatedData.address,
          phoneNumbers: validatedData.phoneNumbers,
          salary: validatedData.salary,
        });
        const currentRoles = await getStaffRoles(db, user.id);
        console.log(currentRoles);
        if (
          _.difference(
            currentRoles.map((c) => c.id),
            validatedData["roles[]"] ?? [],
          ).length > 0 ||
          _.difference(
            validatedData["roles[]"] ?? [],
            currentRoles.map((c) => c.id),
          ).length > 0
        ) {
          await requirePermissions(db, currentUser.id, [
            PermissionsEnum.UpdateUserRoles,
          ]);
          await updateStaffRoles(db, id, validatedData["roles[]"] ?? []);
        }

        if (validatedData.password && validatedData.passwordConfirm) {
          await updatePassword(db, user.id, validatedData.password);
        }
        return json({ success: true });
      });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const user = await requireStaff(prisma, request);
      const id = params.userId as string | undefined;
      await requirePermissions(prisma, user.id, [PermissionsEnum.DeleteStaffs]);
      if (user.id === id) {
        return json(
          { error: "Không thể xóa chính bản thân !", success: false },
          { status: 400 },
        );
      }
      if (!id) return json({ success: false, error: "missing id." }, 400);
      await deleteStaff(id);
      return json({ success: true });
    },
  },
]);
export default function AddUserPage() {
  const { roles, staff } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Sửa nhân viên</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/staffs" className="hover:underline">
              Quản lí nhân viên
            </a>{" "}
            &gt; Sửa nhân viên
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateStaffForm
          roles={roles as unknown as Role[]}
          staff={
            (staff as unknown as Omit<Staff, "id"> & { id?: Staff["id"] } & {
              Roles: StaffRole[];
            }) ?? undefined
          }
        />
      </div>
    </>
  );
}
