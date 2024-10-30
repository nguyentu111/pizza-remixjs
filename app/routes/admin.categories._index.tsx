import { Category } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CategoryTable } from "~/components/admin/category-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { getAllCategories } from "~/models/category.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewCategories]);
  return {
    categories: await getAllCategories(),
  };
};

export default function CategoryManageHome() {
  const { categories } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý danh mục
          </nav>
        </div>
      </div>
      <CategoryTable categories={categories as unknown as Category[]} />
    </div>
  );
}
