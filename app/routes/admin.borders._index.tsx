import { Border } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BorderTable } from "~/components/admin/border-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { getAllBorders } from "~/models/border.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewBorders]);
  return {
    borders: await getAllBorders(),
  };
};

export default function BorderManageHome() {
  const { borders } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Quản lý viền</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý viền
          </nav>
        </div>
      </div>
      <BorderTable borders={borders as unknown as Border[]} />
    </div>
  );
}
