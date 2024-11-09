import { Button } from "~/components/ui/button";
import { useCustomer } from "~/hooks/use-customer";
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
import { motion } from "framer-motion";

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
        Tài khoản của tôi
      </motion.h1>

      <fetcher.Form method="post" ref={formRef} className="space-y-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FormField control={control} name="fullname">
            <InputField type="text" placeholder="Họ Và Tên Của Bạn" />
            <ErrorMessage />
          </FormField>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FormField control={control} name="phoneNumbers">
            <InputField type="tel" placeholder="Số Điện Thoại" readOnly />
            <ErrorMessage />
          </FormField>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang Cập Nhật..." : "Cập Nhật"}
          </Button>
        </motion.div>
      </fetcher.Form>
    </motion.div>
  );
}
