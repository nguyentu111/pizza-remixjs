import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z, ZodSchema, ZodType } from "zod";
import { ActionResultType } from "~/lib/type";

import type { User } from "~/models/user.server";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getSmallImageUrl(secureUrl: string, width = 200, height = 200) {
  const urlParts = secureUrl.split("/upload/");
  const transformation = `w_${width},h_${height},c_fit`; // Adjust transformation as needed
  return `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
}
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { getUser, requireUser } from "~/session.server";
import { DEFAULT_REDIRECT } from "./config.server";
import { prisma } from "./db.server";
export const bytesToMB = (bytes: number): number => {
  return parseFloat((bytes / 1000000).toFixed(2));
};
/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData<T = Record<string, unknown>>(id: string): T {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as T;
}

function isUser(user: unknown): user is User {
  return (
    user != null &&
    typeof user === "object" &&
    "email" in user &&
    typeof user.email === "string" &&
    "username" in user
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}
export function ca<T extends any[], R>(action: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    try {
      return await action(...args);
    } catch (error: any) {
      console.log(error);
      return json(
        {
          error: "An unknown error occurred.",
          success: false,
        },
        { status: 500 },
      ) as unknown as R; // Ensure the return type matches R
    }
  };
}
export const safeAction =
  (
    actions: {
      method: "POST" | "DELETE" | "PATCH" | "PUT";
      role?: string[];
      schema?: ZodSchema;
      _action?: string;
      action: (
        args: ActionFunctionArgs,
        validatedData: any,
      ) => Promise<
        ActionResultType<z.inferFlattenedErrors<ZodSchema>["fieldErrors"]>
      >;
    }[],
  ) =>
  async (
    args: ActionFunctionArgs,
  ): Promise<
    ActionResultType<z.inferFlattenedErrors<ZodSchema>["fieldErrors"]>
  > => {
    try {
      const user = await getUser(prisma, args.request);
      const formData = await args.request.formData();
      const data: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        if (key.endsWith("[]")) {
          data[key] = formData.getAll(key); // Get all values for this key
        } else {
          data[key] = value; // Regular key-value assignment
        }
      }
      console.log({ data });
      const method = args.request.method;
      const _action = data._action;
      const action = actions.find((a) => {
        if (a._action) return a.method === method && a._action === _action;
        return a.method === method;
      });
      if (!action) {
        return json(
          {
            success: false,
            error: _action
              ? `Method ${method} not supported for action '${_action}'.`
              : `Method ${method} not supported for this route.`,
          },
          { status: 404 },
        );
      }
      if (!action.schema) {
        const rs = action.action(args, data);
        return rs;
      }
      const result = action.schema.safeParse(data);
      if (!result.success) {
        return json(
          {
            success: false,
            fieldErrors: result.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }
      const validatedData = result.data;

      console.log({ validatedData });
      const rs = action.action(args, validatedData);
      return rs;
    } catch (error) {
      return json(
        {
          success: false,
          error: (error as Error).message,
        },
        { status: 500 },
      );
    }
  };
export function zodValidate(param: any, schema: z.ZodSchema): boolean {
  const result = schema.safeParse(param);
  return result.success;
}
