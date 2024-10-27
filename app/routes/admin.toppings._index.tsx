import { Topping } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { getAllToppingWithMaterial } from "~/models/topping.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { ToppingTable } from "~/components/admin/topping-table";
import { ToppingWithMaterial } from "~/lib/type";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewToppings]);
  return {
    toppings: await getAllToppingWithMaterial(),
  };
};

export default function ToppingManageHome() {
  const { toppings } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Quản lý topping</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý topping
          </nav>
        </div>
      </div>
      <ToppingTable toppings={toppings as unknown as ToppingWithMaterial[]} />
    </div>
  );
}
