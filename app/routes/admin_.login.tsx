import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { safeAction } from "~/lib/utils";

import { verifyLogin } from "~/models/staff.server";
import { createStaffSession, getStaffId } from "~/session.server";
import {
  ActionResultType,
  ActionZodResponse,
  RawActionResult,
} from "~/lib/type";
import { DEFAULT_REDIRECT } from "~/lib/config.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getStaffId(request);
  if (userId) return redirect("/");
  return json({});
};
const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
  redirectTo: z.string(),
  remember: z.optional(z.string()),
});
export const action = safeAction([
  {
    schema: LoginSchema,
    action: async (
      { request },
      { username, password, redirectTo, remember },
    ): ActionZodResponse<typeof LoginSchema> => {
      const user = await verifyLogin(username, password);
      if (!user) {
        return json(
          { error: "Invalid username or password", success: false },
          { status: 400 },
        );
      }
      if (user.status === "banned")
        return json({ error: "This account has been banned.", success: false });
      return createStaffSession({
        redirectTo,
        remember: remember === "on" ? true : false,
        request,
        staffId: user.id,
      });
    },
    method: "POST",
  },
]);

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || DEFAULT_REDIRECT;
  const actionData =
    useActionData<
      RawActionResult<z.inferFlattenedErrors<typeof LoginSchema>["fieldErrors"]>
    >();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (actionData?.fieldErrors?.username) {
      usernameRef.current?.focus();
    } else if (actionData?.fieldErrors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);
  console.log(actionData);
  return (
    <div className="flex h-screen flex-col justify-center items-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Tên tài khoản
            </label>
            <div className="mt-1">
              <input
                ref={usernameRef}
                id="username"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="username"
                type="username"
                autoComplete="username"
                aria-invalid={
                  actionData?.fieldErrors?.username ? true : undefined
                }
                aria-describedby="username-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                defaultValue={"admin"}
              />
              {actionData?.fieldErrors?.username ? (
                <div className="pt-1 text-red-700" id="username-error">
                  {actionData.fieldErrors.username}
                </div>
              ) : null}
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
                defaultValue={"@@aheng"}
              />
              {actionData?.fieldErrors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.fieldErrors.password}
                </div>
              ) : null}
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
                Ghi nhớ tài khoản
              </label>
            </div>

            <div className="text-center text-sm text-gray-500">
              Không có tài khoản?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/admin/join",
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
