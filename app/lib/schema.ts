import { $Enums, UserStatus } from "@prisma/client";
import { z } from "zod";
const MAX_FILE_SIZE = 5000000;
function checkFileType(file: File) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (!fileType) return false;
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
    if (imageTypes.includes(fileType)) return true;
  }
  return false;
}
export const fileSchema = z
  .any()
  .refine((file: File) => file?.size !== 0, "File is required")
  .refine((file) => file?.size < MAX_FILE_SIZE, "Max size is 5MB.")
  .refine((file) => checkFileType(file), "Only image formats are supported.");

export const insertUserSchema = z
  .object({
    username: z.string().min(1),
    fullName: z.string().min(1),
    status: z.nativeEnum(UserStatus).default("on").optional(),
    email: z.string().email(),
    password: z.string().min(4),
    passwordConfirm: z.string().min(4),
    avatarId: z.string().optional(),
    avatarUrl: z.string().optional(),
    "roles[]": z.array(z.string()).optional(),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["passwordConfirm"],
      });
    }
  });
// Define the update user schema
export const updateUserSchema = z
  .object({
    username: z.string().min(1).optional(),
    fullName: z.string().min(1).optional(),
    status: z.nativeEnum(UserStatus).default("on").optional(),
    email: z.string().email().optional(),
    password: z
      .string()
      .optional()
      .refine(
        (pass) => {
          if (pass) {
            if (pass.length < 4) return false;
          }
          return true;
        },
        { message: "Mật khẩu phải lớn hơn 4 kí tự" },
      )
      .transform((val) => (val === "" ? undefined : val)),
    passwordConfirm: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    avatarId: z.string().optional(),
    avatarUrl: z.string().optional(),
    "roles[]": z.array(z.string()).optional(),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["passwordConfirm"],
      });
    }
  });
export const userSchema = z.object({
  id: z.optional(z.union([z.string(), z.number()])),
  email: z.string(),
});
export const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  "permissions[]": z.array(z.string()).optional(),
});
