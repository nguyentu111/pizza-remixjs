import { Customer, Staff } from "@prisma/client";
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

// export function validateEmail(email: unknown): email is string {
//   return typeof email === "string" && email.length > 3 && email.includes("@");
// }
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
    ) => Promise<ActionResultType<z.ZodError["errors"]>>;
  }[],
) =>
  ca(
    async (
      args: ActionFunctionArgs,
    ): Promise<ActionResultType<z.ZodError["errors"]>> => {
      try {
        const formData = await args.request.formData();
        const data: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
          if (key.endsWith("[]")) {
            if (!data[key]) {
              data[key] = [];
            }
            data[key].push(value);
          } else if (key.includes("[") && key.includes("]")) {
            const match = key.match(/^(\w+)\[(\d+)\]\.(\w+)$/);
            if (match) {
              const [, mainKey, index, subKey] = match;
              if (!data[mainKey]) data[mainKey] = [];
              if (!data[mainKey][parseInt(index)])
                data[mainKey][parseInt(index)] = {};
              data[mainKey][parseInt(index)][subKey] = value;
            } else {
              console.log({ key, value });
              // const match = key.match(/^(\w+)\[([a-f0-9-]+)\]$/);
              // console.log(key, match);
              // if (match) {
              //   const [, mainKey, index] = match;
              //   if (!data[mainKey]) data[mainKey] = [];
              //   data[mainKey][parseInt(index)] = value;
              // }
            }
          } else {
            data[key] = value;
          }
        }

        console.dir({ actionData: data }, { depth: null });
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
          console.dir(
            {
              errors: result.error.errors,
              formErrors: result.error.formErrors,
            },
            { depth: null },
          );
          return json(
            {
              success: false,
              fieldErrors: result.error.errors,
            },
            { status: 400 },
          );
        }
        const validatedData = result.data;

        console.dir({ validatedData }, { depth: null });
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
    .toLowerCase()
    .trim()
    .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a")
    .replace(/[éèẻẽẹêếềểễệ]/g, "e")
    .replace(/[íìỉĩị]/g, "i")
    .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o")
    .replace(/[úùủũụưứừửữự]/g, "u")
    .replace(/[ýỳỷỹỵ]/g, "y")
    .replace(/[đ]/g, "d")
    .replace(/[^\w\s-]+/g, "") // Remove all non-word chars except spaces and -
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
    .replace(/[^\w-]+/g, ""); // Remove all non-word chars
}

// Add these functions to your existing utils.ts
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
export function flattenObject(
  obj: Record<string, any>,
  parentKey = "",
  result: Record<string, any>,
) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          flattenObject(item, `${newKey}[${index}]`, result);
        });
      } else if (typeof value === "object" && value !== null) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
}
export function parseFormName(str: string) {
  const result = [];
  const regex = /([a-zA-Z0-9_]+)|\[(\d+)\]/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match[1]) {
      result.push(match[1]); // Pushes part before bracket or dot
    } else if (match[2]) {
      result.push(Number(match[2])); // Pushes the number inside brackets as an integer
    }
  }

  return result;
}

function deepSet(
  obj: Record<string, any>,
  path: string | string[],
  value: any,
) {
  if (Object(obj) !== obj) return obj; // When obj is not an object
  // If not yet an array, get the keys from the string-path
  if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
  path.slice(0, -1).reduce(
    (
      a,
      c,
      i, // Iterate all of them except the last one
    ) =>
      Object(a[c]) === a[c] // Does the key exist and is its value an object?
        ? // Yes: then follow that path
          a[c]
        : // No: create the key. Is the next key a potential array-index?
          (a[c] =
            Math.abs(Number(path[i + 1])) >> 0 === Number(path[i + 1])
              ? [] // Yes: assign a new array object
              : {}), // No: assign a new plain object
    obj,
  )[path[path.length - 1]] = value; // Finally assign the value to the last key
  return obj; // Return the top-level object to allow chaining
}

// Use it for formData:
export function formDataObject(formData: FormData) {
  const root = {};
  for (const [path, value] of formData) {
    deepSet(root, path, value);
  }
  return root;
}

export function formatDuration(milliseconds: number): string {
  const minutes = Math.round(milliseconds / 1000 / 60);

  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${remainingMinutes} phút`;
}
const SHIPPING_RATE_PER_KM = 5000; // 5,000 VND per km
const MIN_SHIPPING_FEE = 15000; // Minimum shipping fee
export function calculateShippingFee(distanceInMeters: number) {
  const distanceInKm = distanceInMeters / 1000;
  const calculatedFee = Math.ceil(distanceInKm * SHIPPING_RATE_PER_KM);
  return Math.max(calculatedFee, MIN_SHIPPING_FEE);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
