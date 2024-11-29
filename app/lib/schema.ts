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
  name: z.string().min(1, "Tên kích thước l�� bắt buộc"),
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
  borderIds: z.array(z.string()).optional(),
  toppingIds: z.array(z.string()).optional(),
  sizes: z.array(
    z.object({
      sizeId: z.string().min(1, "Vui lòng chọn kích thước"),
      price: stringAsPositiveNumber,
    }),
  ),
  recipes: z.array(
    z.object({ materialId: z.string(), quantity: stringAsPositiveNumber }),
  ),
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
export const updateCustomerSchema = z
  .object({
    fullname: z.string().min(1, "Họ tên không được để trống"),
    phoneNumbers: z.string().min(10, "Số điện thoại không hợp lệ"),
    avatarUrl: z.string().optional(),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.passwordConfirm) {
        return data.password === data.passwordConfirm;
      }
      return true;
    },
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["passwordConfirm"],
    },
  );
export const insertImportSchema = z
  .object({
    providerId: z
      .string()
      .min(1, "Vui lòng chọn nhà cung cấp trước khi tiếp tục."),
    expectedDeliveryDate: z
      .string()
      .min(1, "Vui lòng chọn ngày dự kiến nhận hàng trước khi tiếp tục."),
    quotationLink: z
      .string()
      .min(1, "Vui lòng chọn file báo giá trước khi tiếp tục."),
    totalAmount: stringAsPositiveNumber.optional(),
    materials: z.array(
      z.object({
        materialId: z
          .string()
          .min(1, "Vui lòng chọn nguyên liệu trước khi tiếp tục."),
        expectedQuantity: z
          .string()
          .min(1, "Số lượng dự kiến là bắt buộc")
          .refine(
            (value) => {
              const num = parseFloat(value);
              return !isNaN(num) && num > 0;
            },
            { message: "Số lượng không hợp lệ." },
          ),
        qualityStandard: z.string().min(1, "Tiêu chuẩn chất lượng là bắt buộc"),
        expiredDate: z.string().min(1, "Ngày hết hạn là bắt buộc"),
        pricePerUnit: z
          .string()
          .min(1, "Giá nhập là bắt buộc")
          .refine(
            (value) => {
              const num = parseFloat(value);
              return !isNaN(num) && num > 0;
            },
            { message: "Đơn giá không hợp lệ." },
          ),
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

export const checkoutSchema = z.object({
  address: z.string().min(1, "Vui lòng nhập địa chỉ giao hàng"),
  lat: z.string().min(1, "Vui lòng chọn địa chỉ từ kết quả tìm kiếm"),
  lng: z.string().min(1, "Vui lòng chọn địa chỉ từ kết quả tìm kiếm"),
  shipNote: z.string().optional(),
  paymentMethod: z.enum(["COD", "MOMO", "BANK"]),
  couponCode: z.string().optional(),
  cartItems: z.array(
    z.object({
      productId: z.string(),
      sizeId: z.string(),
      borderId: z.string().optional(),
      toppingId: z.string().optional(),
      quantity: stringAsPositiveNumber,
      totalAmount: stringAsPositiveNumber,
    }),
  ),
});

// Thêm schema cho form đổi mật khẩu
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
      });
    }
  });
export const deleteInventorySchema = z.object({
  materialId: z.string(),
  expiredDate: z.string(),
});
