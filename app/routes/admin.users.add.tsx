import { Role } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { AddOrUpdateUserForm } from "~/components/admin/add-or-update-user-form";
import { getAllRoles } from "~/models/role.server";

export const loader = async () => {
  return { roles: await getAllRoles() };
};

export default function AddUserPage() {
  const { roles } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm tài khoản</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/users" className="hover:underline">
              Quản lí tài khoản
            </a>{" "}
            &gt; Thêm tài khoản
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateUserForm roles={roles as unknown as Role[]} />;
      </div>
    </>
  );
}
