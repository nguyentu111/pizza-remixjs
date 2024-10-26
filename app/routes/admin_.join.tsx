import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { ActionResultType, RawActionResult } from "~/lib/type";
import { safeAction } from "~/lib/utils";
import { createStaff, getStaffByUsername } from "~/models/staff.server";
import { createStaffSession, getStaffId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/lib/utils";
import { Staff } from "@prisma/client";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getStaffId(request);
  if (userId) return redirect("/");
  return json({});
};
const JoinSchema = z.object({
  fullname: z.string().min(1),
  username: z.string().min(1),
  phoneNumbers: z.string().length(10),
  password: z.string().min(1),
  redirectTo: z.optional(z.string()),
});

export const action = safeAction([
  {
    schema: JoinSchema,
    method: "POST",
    action: async (
      { request },
      data,
    ): Promise<
      ActionResultType<z.inferFlattenedErrors<typeof JoinSchema>["fieldErrors"]>
    > => {
      const validatedData = data as z.infer<typeof JoinSchema>;
      const redirect = safeRedirect(validatedData.redirectTo, "/");
      const existingStaff = await getStaffByUsername(validatedData.username);
      if (existingStaff) {
        return json(
          {
            error: "A user already exists with this username",
            success: false,
          },
          { status: 403 },
        );
      }
      const staff: Staff = await createStaff(
        {
          fullname: validatedData.fullname,
          phoneNumbers: validatedData.phoneNumbers,
          username: validatedData.username,
          salary: null,
          status: "on",
          image: null,
        },
        { password: validatedData.password },
      );

      return createStaffSession({
        redirectTo: redirect,
        remember: false,
        request,
        staffId: staff.id,
      });
    },
  },
]);

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData =
    useActionData<
      RawActionResult<z.inferFlattenedErrors<typeof JoinSchema>["fieldErrors"]>
    >();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log({ actionData });
    if (actionData?.fieldErrors?.password) {
      usernameRef.current?.focus();
    } else if (actionData?.fieldErrors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);
  console.log({ actionData });
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username address
            </label>
            <div className="mt-1">
              <input
                ref={usernameRef}
                id="username"
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
              htmlFor="fullname"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <div className="mt-1">
              <input
                id="fullname"
                name="fullname"
                type="text"
                aria-invalid={
                  actionData?.fieldErrors?.fullname ? true : undefined
                }
                aria-describedby="fullname-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.fullname ? (
                <div className="pt-1 text-red-700" id="fullname-error">
                  {actionData.fieldErrors.fullname}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Số điện thoại
            </label>
            <div className="mt-1">
              <input
                ref={usernameRef}
                id="phoneNumbers"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="phoneNumbers"
                type="phoneNumbers"
                autoComplete="phoneNumbers"
                aria-invalid={
                  actionData?.fieldErrors?.phoneNumbers ? true : undefined
                }
                aria-describedby="phoneNumbers-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.phoneNumbers ? (
                <div className="pt-1 text-red-700" id="phoneNumbers-error">
                  {actionData.fieldErrors.phoneNumbers}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
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
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/admin/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
