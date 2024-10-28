import { Button } from "~/components/ui/button";
import { NavLink } from "@remix-run/react";
import { useCustomer } from "~/lib/utils";
import { useForm } from "~/hooks/use-form";
import { FormField } from "~/components/shared/form/form-field";
import { InputField } from "~/components/shared/form/form-fields/input-field";
import { ErrorMessage } from "~/components/shared/form/error-message";
import { safeAction } from "~/lib/utils";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { updateCustomerSchema } from "~/lib/schema";
import { updateCustomer } from "~/models/customer.server";
import { requireCustomerId } from "~/session.server";
import { prisma } from "~/lib/db.server";
export const action = safeAction([
  {
    method: "POST",
    action: async ({ request }, validatedData) => {
      const customerId = await requireCustomerId(request);
      const { fullname } = validatedData as z.infer<
        typeof updateCustomerSchema
      >;
      await updateCustomer(prisma, customerId, { fullname });
      return json({ success: true });
    },
    schema: updateCustomerSchema,
  },
]);
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireCustomerId(request);
  return null;
};

export default function AccountPage() {
  const customer = useCustomer();
  const { fetcher, isSubmitting, control, formRef } = useForm({
    defaultValues: {
      fullname: customer.fullname,
      phoneNumbers: customer.phoneNumbers,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

      <nav className="flex space-x-4 mb-6">
        <NavLink
          to="/account/personal-info"
          className="text-blue-500 hover:text-blue-800"
        >
          Thông Tin Cá Nhân
        </NavLink>
        <NavLink
          to="/account/change-password"
          className="text-blue-500 hover:text-blue-800"
        >
          Thay Đổi Mật Khẩu
        </NavLink>
        <NavLink
          to="/account/order-history"
          className="text-blue-500 hover:text-blue-800"
        >
          Đơn Đã Đặt Hàng
        </NavLink>
        <NavLink
          to="/account/delivery-address"
          className="text-blue-500 hover:text-blue-800"
        >
          Địa Chỉ Giao Hàng
        </NavLink>
        <NavLink
          to="/account/reward-points"
          className="text-blue-500 hover:text-blue-800"
        >
          Lịch Sử Điểm Thưởng
        </NavLink>
      </nav>

      <div>
        <fetcher.Form
          method="post"
          ref={formRef}
          className="space-y-4 max-w-md"
        >
          <FormField control={control} name="fullname">
            <InputField type="text" placeholder="Họ Và Tên Của Bạn" />
            <ErrorMessage />
          </FormField>
          <FormField control={control} name="phoneNumbers">
            <InputField type="tel" placeholder="Số Điện Thoại" readOnly />
            <ErrorMessage />
          </FormField>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang Cập Nhật..." : "Cập Nhật"}
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}
