import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { safeAction } from "~/lib/utils";

import { useForm } from "~/hooks/use-form";
import { DEFAULT_REDIRECT } from "~/lib/config.server";
import { ActionZodResponse } from "~/lib/type";
import { verifyCustomerLogin } from "~/models/customer.server";
import { createCustomerSession, getCustomerId } from "~/session.server";
import { useToast } from "~/hooks/use-toast";
import { InputField } from "~/components/shared/form/form-fields/input-field";
import { FormField } from "~/components/shared/form/form-field";
import { Label } from "~/components/ui/label";
import { ErrorMessage } from "~/components/shared/form/error-message";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const customerId = await getCustomerId(request);
  if (customerId) return redirect("/");
  return json({});
};

const LoginSchema = z.object({
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  redirectTo: z.string(),
  remember: z.optional(z.string()),
});

export const action = safeAction([
  {
    schema: LoginSchema,
    action: async (
      { request },
      { phoneNumber, password, redirectTo, remember },
    ): ActionZodResponse<typeof LoginSchema> => {
      const customer = await verifyCustomerLogin(phoneNumber, password);
      if (!customer) {
        return json(
          { error: "Số điện thoại hoặc mật khẩu không đúng", success: false },
          { status: 400 },
        );
      }
      if (customer.status === "banned")
        return json({ error: "Tài khoản này đã bị khóa.", success: false });
      return createCustomerSession({
        redirectTo,
        remember: remember === "on" ? true : false,
        request,
        customerId: customer.id,
      });
    },
    method: "POST",
  },
]);

export const meta: MetaFunction = () => [{ title: "Đăng nhập" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || DEFAULT_REDIRECT;
  const { toast } = useToast();
  const { fetcher, control } = useForm<typeof LoginSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh! Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Đăng nhập thành công.",
      });
    },
  });

  return (
    <div className="flex flex-col justify-center min-h-[80vh] items-center">
      <div className="mx-auto w-full max-w-md px-8">
        <fetcher.Form method="post" className="space-y-6">
          <div>
            <div className="mt-1">
              <FormField control={control} name="phoneNumber">
                <Label>Số điện thoại</Label>
                <InputField />
                <ErrorMessage />
              </FormField>
            </div>
          </div>

          <div>
            <FormField control={control} name="password">
              <Label>Mật khẩu</Label>
              <InputField type="password" />
              <ErrorMessage />
            </FormField>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />

          <button
            type="submit"
            className="w-full rounded bg-blue-900 px-4 py-2 text-white hover:bg-blue-800 focus:bg-blue-700"
          >
            Đăng nhập
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            <div className="text-center text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/register",
                  search: searchParams.toString(),
                }}
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
