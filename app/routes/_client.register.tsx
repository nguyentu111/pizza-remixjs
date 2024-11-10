import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { safeAction } from "~/lib/utils";

import { useForm } from "~/hooks/use-form";
import {
  createCustomer,
  getCustomerByPhoneNumber,
} from "~/models/customer.server";
import { createCustomerSession, getCustomerId } from "~/session.server";
import { safeRedirect } from "~/lib/utils";
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

const RegisterSchema = z.object({
  fullname: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumbers: z.string().length(10, "Số điện thoại phải có 10 chữ số"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  redirectTo: z.string(),
});

export const action = safeAction([
  {
    schema: RegisterSchema,
    method: "POST",
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof RegisterSchema>;
      const redirect = safeRedirect(validatedData.redirectTo, "/");
      const existingCustomer = await getCustomerByPhoneNumber(
        validatedData.phoneNumbers,
      );
      if (existingCustomer) {
        return json(
          {
            error: "Số điện thoại này đã được đăng ký",
            success: false,
          },
          { status: 403 },
        );
      }
      const customer = await createCustomer(
        {
          fullname: validatedData.fullname,
          phoneNumbers: validatedData.phoneNumbers,
          status: "on",
          avatarUrl: null,
        },
        validatedData.password,
      );

      return createCustomerSession({
        redirectTo: redirect,
        remember: false,
        request,
        customerId: customer.id,
      });
    },
  },
]);

export const meta: MetaFunction = () => [{ title: "Đăng ký" }];

export default function Register() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const { toast } = useToast();

  const { fetcher, control } = useForm<typeof RegisterSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh! Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Đăng ký thành công.",
      });
    },
  });

  return (
    <div className="flex min-h-[80vh] flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <fetcher.Form method="post" className="space-y-6">
          <div>
            <FormField control={control} name="fullname">
              <Label>Họ tên</Label>
              <InputField autoFocus />
              <ErrorMessage />
            </FormField>
          </div>

          <div>
            <FormField control={control} name="phoneNumbers">
              <Label>Số điện thoại</Label>
              <InputField type="tel" />
              <ErrorMessage />
            </FormField>
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
            Đăng ký
          </button>

          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Đã có tài khoản?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
