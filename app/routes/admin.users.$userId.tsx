import { Role, User, UserRole } from "@prisma/client";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateUserForm } from "~/components/admin/add-or-update-user-form";
import { prisma } from "~/lib/db.server";
import { updateUserSchema } from "~/lib/schema";
import { ca, safeAction } from "~/lib/utils";
import { getAllRoles } from "~/models/role.server";
import {
  deleteUser,
  getUserById,
  updatePassword,
  updateUser,
  updateUserRoles,
} from "~/models/user.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const id = params.userId;
  const user = await getUserById(prisma, id as string);
  if (!user) return redirect("/notfound");
  return {
    roles: await getAllRoles(),
    user,
  };
};

export const action = safeAction([
  {
    method: "PUT",
    schema: updateUserSchema, // Add the schema for validation
    action: ca(async ({ request, params }, data) => {
      const currentUser = await requireUser(prisma, request);
      const validatedData = data as z.infer<typeof updateUserSchema>;

      const id = params.userId as string | undefined;
      if (!id)
        return json(
          { success: false, error: "Missing user ID." },
          { status: 400 },
        );

      return await prisma.$transaction(async (db) => {
        const user = await getUserById(db, id);
        if (!user)
          return json(
            { success: false, error: "Không tìm thấy user." },
            { status: 404 },
          );
        console.log(
          currentUser.id === user.id,
          validatedData?.status === undefined,
          validatedData?.status === "banned",
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
        await updateUser(db, id, {
          avatarId: validatedData.avatarId,
          avatarUrl: validatedData.avatarUrl,
          email: validatedData.email,
          fullName: validatedData.fullName,
          username: validatedData.username,
          status: validatedData.status ?? "banned",
        });

        if (validatedData["roles[]"])
          await updateUserRoles(db, id, validatedData["roles[]"]);
        if (validatedData.password && validatedData.passwordConfirm) {
          await updatePassword(db, user.id, validatedData.password);
        }
        return json({ success: true });
      });
    }),
  },
  {
    method: "DELETE",
    action: ca(async ({ request, params }) => {
      const user = await requireUser(prisma, request);
      const id = params.userId as string | undefined;
      if (user.id === id) {
        return json(
          { error: "Không thể xóa chính bản thân !", success: false },
          { status: 400 },
        );
      }
      if (!id) return json({ success: false, error: "missing id." }, 400);
      await deleteUser(id);
      return json({ success: true });
    }),
  },
]);
export default function AddUserPage() {
  const { roles, user } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Sửa tài khoản</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/users" className="hover:underline">
              Quản lí tài khoản
            </a>{" "}
            &gt; Sửa tài khoản
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateUserForm
          roles={roles as unknown as Role[]}
          user={
            (user as unknown as Omit<User, "id"> & { id?: User["id"] } & {
              roles: UserRole[];
            }) ?? undefined
          }
        />
      </div>
    </>
  );
}
