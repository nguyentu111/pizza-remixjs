import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateCouponForm } from "~/components/admin/add-or-update-coupon-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertCouponSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { createCoupon, getCouponByCode } from "~/models/coupon.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const action = safeAction([
  {
    method: "POST",
    schema: insertCouponSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertCouponSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateCoupons,
      ]);
      const existingCoupon = await getCouponByCode(validatedData.code);
      if (existingCoupon)
        return json(
          { error: "Mã giảm giá đã tồn tại.", success: false },
          { status: 403 },
        );

      await createCoupon({
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description,
        discount: parseFloat(validatedData.discount),
        quantity: validatedData.quantity,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        image: validatedData.image ?? null, // New field
        bannerImage: validatedData.bannerImage ?? null,
        createdBy: { connect: { id: currentUserId } },
      });
      return json({
        success: true,
      });
    },
  },
]);

export default function AddCouponPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm mã giảm giá</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/coupons" className="hover:underline">
              Quản lý mã giảm giá
            </a>{" "}
            &gt; Thêm mã giảm giá
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateCouponForm />
      </div>
    </div>
  );
}
