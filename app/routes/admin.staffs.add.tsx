import { Role } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { AddOrUpdateStaffForm } from "~/components/admin/add-or-update-staff-form";
import { getAllRoles } from "~/models/role.server";
import { ErrorBoundary } from "~/components/shared/error-boudary";

export { ErrorBoundary };

export const loader = async () => {
  return { roles: await getAllRoles() };
};

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
