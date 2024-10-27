import { Product } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ProductTable } from "~/components/admin/product-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { ProductWithCategory } from "~/lib/type";
import { getAllProducts } from "~/models/product.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  // await requirePermissions(prisma, user, [PermissionsEnum.ViewProducts]);
  return {
    products: await getAllProducts(),
  };
};

export default function ProductManageHome() {
  const { products } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý sản phẩm
          </nav>
        </div>
      </div>
      <ProductTable products={products as unknown as ProductWithCategory[]} />
    </div>
  );
}
