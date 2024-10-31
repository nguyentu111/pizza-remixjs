import { json, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { useForm } from "~/hooks/use-form";
import { FormField } from "~/components/shared/form/form-field";
import { InputField } from "~/components/shared/form/form-fields/input-field";
import { ErrorMessage } from "~/components/shared/form/error-message";
import { Button } from "~/components/ui/button";
import { safeAction } from "~/lib/utils";
import { changePasswordSchema } from "~/lib/schema";
import { prisma } from "~/lib/db.server";
import { requireCustomer } from "~/session.server";
import {
  verifyCustomerLogin,
  updateCustomerPassword,
} from "~/models/customer.server";
import { useToast } from "~/hooks/use-toast";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireCustomer(prisma, request);
  return null;
};

export const action = safeAction([
  {
    method: "POST",
    schema: changePasswordSchema,
    action: async ({ request }, data) => {
      const customer = await requireCustomer(prisma, request);
      const { currentPassword, newPassword } = data as z.infer<
        typeof changePasswordSchema
      >;

      // Verify current password
      const isValid = await verifyCustomerLogin(
        customer.phoneNumbers,
        currentPassword,
      );

      if (!isValid) {
        return json(
          { success: false, error: "Mật khẩu hiện tại không đúng" },
          { status: 400 },
        );
      }

      // Update password
      await prisma.$transaction(async (tx) => {
        await updateCustomerPassword(tx, customer.id, newPassword);
      });

      return json({ success: true });
    },
  },
]);

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const { fetcher, isSubmitting, control, formRef } = useForm<
    typeof changePasswordSchema
  >({
    onSuccess: () => {
      formRef.current?.reset();
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được cập nhật",
      });
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Đổi mật khẩu</h1>

      <fetcher.Form method="post" ref={formRef} className="space-y-4 max-w-md">
        <FormField control={control} name="currentPassword">
          <InputField
            type="password"
            placeholder="Mật khẩu hiện tại"
            autoComplete="current-password"
          />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="newPassword">
          <InputField
            type="password"
            placeholder="Mật khẩu mới"
            autoComplete="new-password"
          />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="confirmPassword">
          <InputField
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            autoComplete="new-password"
          />
          <ErrorMessage />
        </FormField>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </Button>
      </fetcher.Form>
    </div>
  );
}
