import { Staff } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { StaffTable } from "~/components/admin/staff-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { getAllStaff } from "~/models/staff.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  // await requirePermissions(prisma, user, [PermissionsEnum.ViewUsers]);
  return {
    staffs: await getAllStaff(),
  };
};
export default function UserManegeHome() {
  const { staffs } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4  sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Quản lí nhân viên</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lí nhân viên
          </nav>
        </div>
      </div>
      <StaffTable staffs={staffs as unknown as Staff[]} />
    </>
  );
}
