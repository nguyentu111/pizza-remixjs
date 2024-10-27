import { Staff } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import { clsx, type ClassValue } from "clsx";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { z, ZodSchema } from "zod";
import { ActionResultType } from "~/lib/type";
import { DEFAULT_REDIRECT } from "./config.server";
import { CustomHttpError } from "./error";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getSmallImageUrl(secureUrl: string, width = 200, height = 200) {
  const urlParts = secureUrl.split("/upload/");
  const transformation = `w_${width},h_${height},c_fit`; // Adjust transformation as needed
  return `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
}
export const bytesToMB = (bytes: number): number => {
  return parseFloat((bytes / 1000000).toFixed(2));
};
/**
 * This should be used any time the redirect path is staff-provided
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

function isStaff(staff: unknown): staff is Staff {
  return (
    staff != null &&
    typeof staff === "object" &&
    "email" in staff &&
    typeof staff.email === "string" &&
    "staffname" in staff
  );
}

export function useOptionalStaff(): Staff | undefined {
  const data = useMatchesData<{ staff?: Staff }>("routes/admin");
  if (!data) {
    return undefined;
  }
  return data.staff;
}

export function useStaff(): Staff {
  const maybeStaff = useOptionalStaff();
  if (!maybeStaff) {
    throw new Error(
      "No staff found in root loader, but staff is required by useStaff. If staff is optional, try useOptionalStaff instead.",
    );
  }
  return maybeStaff;
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
      if (error instanceof CustomHttpError) {
        return json(
          {
            error: error.message,
            success: false,
          },
          { status: error.statusCode },
        ) as R; // Ensure the return type matches R
      }
      return json(
        {
          error:
            process.env.NODE_ENV === "production"
              ? "An unknown error occurred."
              : "DEV-ENABLED only : " + (error as Error).message,
          success: false,
        },
        { status: 500 },
      ) as R; // Ensure the return type matches R
    }
  };
}
export const safeAction = (
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
  ca(
    async (
      args: ActionFunctionArgs,
    ): Promise<
      ActionResultType<z.inferFlattenedErrors<ZodSchema>["fieldErrors"]>
    > => {
      try {
        const formData = await args.request.formData();
        const data: Record<string, any> = {};

        for (const [key, value] of formData.entries()) {
          if (key.endsWith("[]")) {
            // Handle array inputs
            const baseKey = key.slice(0, -2);
            if (!data[baseKey]) {
              data[baseKey] = [];
            }
            data[baseKey].push(value);
          } else if (key.includes("[") && key.includes("]")) {
            // Handle object-like inputs (e.g., sizes[sizeId])
            const [objKey, nestedKey] = key.split(/[\[\]]/);
            if (!data[objKey]) {
              data[objKey] = {};
            }
            data[objKey][nestedKey] = value;
          } else {
            data[key] = value;
          }
        }

        console.log({ actionData: data });

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
        return action.action(args, validatedData);
      } catch (error) {
        return json(
          {
            success: false,
            error: (error as Error).message,
          },
          { status: 500 },
        );
      }
    },
  );
export function zodValidate(param: any, schema: z.ZodSchema): boolean {
  const result = schema.safeParse(param);
  return result.success;
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
