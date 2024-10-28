import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { safeAction } from "~/lib/utils";

import { verifyCustomerLogin } from "~/models/customer.server";
import { createCustomerSession, getCustomerId } from "~/session.server";
import {
  ActionResultType,
  ActionZodResponse,
  RawActionResult,
} from "~/lib/type";
import { DEFAULT_REDIRECT } from "~/lib/config.server";

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
  const actionData =
    useActionData<
      RawActionResult<z.inferFlattenedErrors<typeof LoginSchema>["fieldErrors"]>
    >();
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.fieldErrors?.phoneNumber) {
      phoneNumberRef.current?.focus();
    } else if (actionData?.fieldErrors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Số điện thoại
            </label>
            <div className="mt-1">
              <input
                ref={phoneNumberRef}
                id="phoneNumber"
                required
                autoFocus={true}
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                aria-invalid={
                  actionData?.fieldErrors?.phoneNumber ? true : undefined
                }
                aria-describedby="phoneNumber-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.phoneNumber && (
                <div className="pt-1 text-red-700" id="phoneNumber-error">
                  {actionData.fieldErrors.phoneNumber}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={
                  actionData?.fieldErrors?.password ? true : undefined
                }
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.fieldErrors.password}
                </div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          {actionData?.error && (
            <p className="text-destructive">{actionData.error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
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
        </Form>
      </div>
    </div>
  );
}
