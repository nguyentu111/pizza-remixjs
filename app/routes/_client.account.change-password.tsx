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
import { verifyCustomerLogin, updatePassword } from "~/models/customer.server";
import { useToast } from "~/hooks/use-toast";
import { motion } from "framer-motion";

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
        await updatePassword(tx, customer.id, newPassword);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold mb-6"
      >
        Đổi mật khẩu
      </motion.h1>

      <fetcher.Form method="post" ref={formRef} className="space-y-4 max-w-md">
        {["currentPassword", "newPassword", "confirmPassword"].map(
          (field, index) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <FormField control={control} name={field}>
                <InputField
                  type="password"
                  placeholder={
                    field === "currentPassword"
                      ? "Mật khẩu hiện tại"
                      : field === "newPassword"
                        ? "Mật khẩu mới"
                        : "Xác nhận mật khẩu mới"
                  }
                  autoComplete={
                    field === "currentPassword"
                      ? "current-password"
                      : "new-password"
                  }
                />
                <ErrorMessage />
              </FormField>
            </motion.div>
          ),
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </Button>
        </motion.div>
      </fetcher.Form>
    </motion.div>
  );
}
