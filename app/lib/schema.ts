import { $Enums, StaffStatus } from "@prisma/client";
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

export const insertStaffSchema = z
  .object({
    username: z.string().min(1),
    fullname: z.string().min(1),
    address: z.string().optional(),
    status: z.nativeEnum(StaffStatus).default("on").optional(),
    password: z.string().min(4),
    passwordConfirm: z.string().min(4),
    image: z.string().optional(),
    "roles[]": z.array(z.string()).optional(),
    phoneNumbers: z.string().length(10),
    salary: z.number().optional(),
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
export const updateStaffSchema = z
  .object({
    username: z.string().min(1).optional(),
    fullname: z.string().min(1).optional(),
    status: z.nativeEnum(StaffStatus).default("on").optional(),
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
    image: z.string().optional(),
    "roles[]": z.array(z.string()).optional(),
    // .transform((r) => (r === undefined ? [] : r)),
    address: z.string().optional(),
    phoneNumbers: z.string().length(10).optional(),
    salary: z.number().optional(),
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

// Helper function to validate string as number
const stringAsPositiveNumber = z.string().refine(
  (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  },
  { message: "Số không hợp lệ." },
);

// Updated schema for inserting a Border
export const insertBorderSchema = z.object({
  name: z.string().min(1, "Tên viền là bắt buộc"),
  price: stringAsPositiveNumber,
  image: z.string().optional(),
});

// Updated schema for inserting a Material
export const insertMaterialSchema = z.object({
  name: z.string().min(1, "Tên nguyên liệu là bắt buộc"),
  unit: z.enum(["kg", "g", "ml", "l"], {
    errorMap: () => ({ message: "Đơn vị không hợp lệ" }),
  }),
  warningLimits: stringAsPositiveNumber,
  image: z.string().optional(),
});

// New schema for inserting a Size
export const insertSizeSchema = z.object({
  name: z.string().min(1, "Tên kích thước là bắt buộc"),
  image: z.string().optional(),
});

// Updated schema for inserting a Topping
export const insertToppingSchema = z.object({
  name: z.string().min(1, "Tên topping là bắt buộc"),
  price: stringAsPositiveNumber,
  materialId: z.string().min(1, "Nguyên liệu là bắt buộc"),
  image: z.string().optional(),
});

// Updated schema for inserting a Product
export const insertProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  shortDescription: z.string().min(1, "Mô tả ngắn là bắt buộc"),
  detailDescription: z.string().optional(),
  slug: z.string().min(1, "Slug là bắt buộc"),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
  "borderIds[]": z.array(z.string()).optional(),
  "toppingIds[]": z.array(z.string()).optional(),
  sizes: z
    .array(z.object({ sizeId: z.string(), price: stringAsPositiveNumber }))
    .optional(),
  recipes: z
    .array(
      z.object({ materialId: z.string(), quantity: stringAsPositiveNumber }),
    )
    .optional(),
  image: z.string().optional(),
  image_mobile: z.string().optional(),
});

// New schema for inserting a Category
export const insertCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  image: z.string().optional(),
});

// Add this new schema definition
export const insertProviderSchema = z.object({
  name: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  image: z.string().optional(),
});

// Add this new schema definition for inserting a Coupon
export const insertCouponSchema = z.object({
  code: z.string().min(1, "Mã giảm giá là bắt buộc"),
  name: z.string().min(1, "Tên mã giảm giá là bắt buộc"),
  description: z.string().optional(),
  discount: stringAsPositiveNumber,
  quantity: z.string().transform(Number).pipe(z.number().positive()),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Ngày bắt đầu không hợp lệ",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Ngày kết thúc không hợp lệ",
  }),
  image: z.string().optional(), // New field
  bannerImage: z.string().optional(),
});
export const updateCustomerSchema = z.object({
  fullname: z.string().min(1, "Tên không được để trống"),
});
export const insertImportSchema = z
  .object({
    providerId: z.string().min(1, "Provider is required"),
    expectedDeliveryDate: z.string().optional(),
    quotationLink: z.string().optional(),
    totalAmount: stringAsPositiveNumber.optional(),
    materials: z.array(
      z.object({
        materialId: z.string().min(1, "Material is required"),
        expectedQuantity: stringAsPositiveNumber.optional(),
        qualityStandard: z.string().optional(),
        expiredDate: z.string().optional(),
        pricePerUnit: stringAsPositiveNumber.optional(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const hasQuotation = ctx.path.some((p) => p === "quotationLink");
    if (hasQuotation && !data.materials.some((m) => m.pricePerUnit)) {
      ctx.addIssue({
        code: "custom",
        message: "Price is required when quotation is provided",
      });
    }
  });

export const importMaterialSchema = z.object({
  materialId: z.string().min(1, "Material is required"),
  expectedQuantity: z.string().min(1, "Quantity is required"),
  qualityStandard: z.string().optional(),
  expiredDate: z.string().optional(),
  pricePerUnit: z.string().optional(),
});
export const receiveImportSchema = z.object({
  materials: z.array(
    z.object({
      materialId: z.string().min(1, "Material is required"),
      actualGood: stringAsPositiveNumber,
      actualDefective: stringAsPositiveNumber,
      expiredDate: z.string().min(1, "Ngày hết hạn là bắt buộc"),
      pricePerUnit: stringAsPositiveNumber,
    }),
  ),
});
