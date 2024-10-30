import { Coupon } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateCouponForm } from "~/components/admin/add-or-update-coupon-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertCouponSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import {
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "~/models/coupon.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const couponId = params.couponId;
  if (!couponId) {
    throw new Response("Not Found", { status: 404 });
  }
  const coupon = await getCouponById(couponId);
  if (!coupon) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ coupon });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertCouponSchema,
    action: async ({ request, params }, data) => {
      const couponId = params.couponId;
      if (!couponId) {
        return json(
          { error: "Coupon ID is required", success: false },
          { status: 400 },
        );
      }
      const validatedData = data as z.infer<typeof insertCouponSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateCoupons,
      ]);

      await updateCoupon(couponId, {
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description,
        discount: parseFloat(validatedData.discount),
        quantity: validatedData.quantity,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        image: validatedData.image ?? undefined,
        bannerImage: validatedData.bannerImage ?? undefined,
      });
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const couponId = params.couponId;
      if (!couponId) {
        return json(
          { error: "Coupon ID is required", success: false },
          { status: 400 },
        );
      }
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteCoupons,
      ]);

      await deleteCoupon(couponId);
      return json({ success: true });
    },
  },
]);

export default function UpdateCouponPage() {
  const { coupon } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật mã giảm giá</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/coupons" className="hover:underline">
              Quản lý mã giảm giá
            </a>{" "}
            &gt; Cập nhật mã giảm giá
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateCouponForm coupon={coupon as unknown as Coupon} />
      </div>
    </div>
  );
}
