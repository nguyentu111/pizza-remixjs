import { Coupon } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CouponTable } from "~/components/admin/coupon-table";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { getAllCoupons } from "~/models/coupon.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.ViewCoupons]);
  return {
    coupons: await getAllCoupons(),
  };
};

export default function CouponManageHome() {
  const { coupons } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý mã giảm giá
          </nav>
        </div>
      </div>
      <CouponTable coupons={coupons as unknown as Coupon[]} />
    </>
  );
}
