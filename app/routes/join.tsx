import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { ActionResultType, RawActionResult } from "~/lib/type";
import { ca, safeAction } from "~/lib/utils";

import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  User,
} from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/lib/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};
const JoinSchema = z.object({
  email: z.string().min(1),
  fullName: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  redirectTo: z.optional(z.string()),
});

export const action = safeAction([
  {
    schema: JoinSchema,
    method: "POST",
    action: ca(
      async (
        { request },
        { email, fullName, password, username, redirectTo },
      ): Promise<
        ActionResultType<
          z.inferFlattenedErrors<typeof JoinSchema>["fieldErrors"]
        >
      > => {
        const redirect = safeRedirect(redirectTo, "/");
        if (!validateEmail(email)) {
          return json(
            { error: "invalid email", success: false },
            { status: 400 },
          );
        }
        const existingUser1 = await getUserByEmail(email);
        if (existingUser1) {
          return json(
            {
              error: "A user already exists with this email",
              success: false,
            },
            { status: 403 },
          );
        }
        const existingUser2 = await getUserByUsername(username);
        if (existingUser2) {
          return json(
            {
              error: "A user already exists with this username",
              success: false,
            },
            { status: 403 },
          );
        }
        const user: User = await createUser(
          { email, fullName, username },
          { password },
        );

        return createUserSession({
          redirectTo: redirect,
          remember: false,
          request,
          userId: user.id,
        });
      },
    ),
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
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log({ actionData });
    if (actionData?.fieldErrors?.password) {
      emailRef.current?.focus();
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.fieldErrors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.fieldErrors.email}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <div className="mt-1">
              <input
                id="fullName"
                name="fullName"
                type="text"
                aria-invalid={
                  actionData?.fieldErrors?.fullName ? true : undefined
                }
                aria-describedby="fullName-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.fieldErrors?.fullName ? (
                <div className="pt-1 text-red-700" id="fullName-error">
                  {actionData.fieldErrors.fullName}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
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
                  pathname: "/login",
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
