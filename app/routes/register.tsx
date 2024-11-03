import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { ActionResultType, RawActionResult } from "~/lib/type";
import { safeAction } from "~/lib/utils";
import {
  createCustomer,
  getCustomerByPhoneNumber,
} from "~/models/customer.server";
import { createCustomerSession, getCustomerId } from "~/session.server";
import { safeRedirect } from "~/lib/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const customerId = await getCustomerId(request);
  if (customerId) return redirect("/");
  return json({});
};

const RegisterSchema = z.object({
  fullname: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumbers: z.string().length(10, "Số điện thoại phải có 10 chữ số"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  redirectTo: z.optional(z.string()),
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
  const actionData =
    useActionData<
      RawActionResult<
        z.inferFlattenedErrors<typeof RegisterSchema>["fieldErrors"]
      >
    >();
  const fullnameRef = useRef<HTMLInputElement>(null);
  const phoneNumbersRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.fieldErrors?.fullname) {
      fullnameRef.current?.focus();
    } else if (actionData?.fieldErrors?.phoneNumbers) {
      phoneNumbersRef.current?.focus();
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
              htmlFor="fullname"
              className="block text-sm font-medium text-gray-700"
            >
              Họ tên
            </label>
            <div className="mt-1">
              <input
                ref={fullnameRef}
                id="fullname"
                autoFocus={true}
                name="fullname"
                type="text"
                autoComplete="name"
                aria-invalid={
                  actionData?.fieldErrors?.fullname ? true : undefined
                }
                aria-describedby="fullname-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.fullname && (
                <div className="pt-1 text-red-700" id="fullname-error">
                  {actionData.fieldErrors.fullname}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="phoneNumbers"
              className="block text-sm font-medium text-gray-700"
            >
              Số điện thoại
            </label>
            <div className="mt-1">
              <input
                ref={phoneNumbersRef}
                id="phoneNumbers"
                name="phoneNumbers"
                type="tel"
                autoComplete="tel"
                aria-invalid={
                  actionData?.fieldErrors?.phoneNumbers ? true : undefined
                }
                aria-describedby="phoneNumbers-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.phoneNumbers && (
                <div className="pt-1 text-red-700" id="phoneNumbers-error">
                  {actionData.fieldErrors.phoneNumbers}
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
                autoComplete="new-password"
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
        </Form>
      </div>
    </div>
  );
}
