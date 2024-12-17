import {
  Category,
  Product,
  Topping,
  Material,
  ProductSize,
  Border,
  ProductBorder,
  ProductTopping,
  Size,
  Order,
  OrderDetail,
  Customer,
  Coupon,
} from "@prisma/client";
import { TypedResponse } from "@remix-run/node";
import { z, ZodSchema } from "zod";
export enum PermissionsEnum {
  ViewDashboard = "view-dashboard",

  ViewCustomers = "view-customers",
  CreateCustomers = "create-customers",
  UpdateCustomers = "update-customers",
  BanCustomers = "ban-customers",
  DeleteCustomers = "delete-customers",

  ViewMedia = "view-media",
  UpLoadMedia = "upload-media",
  UpdateMedia = "update-media",
  DeleteMedia = "delete-media",

  ViewRoles = "view-roles",
  AddRoles = "add-roles",
  UpdateRoles = "update-roles",
  UpdateUserRoles = "update-user-roles",
  DeleteRoles = "delete-roles",

  ViewPermissions = "view-permissions",
  CreatePermissions = "create-permissions",
  DeletePermissions = "delete-permissions",

  ViewProducts = "view-products",
  CreateProducts = "create-products",
  UpdateProducts = "update-products",
  DeleteProducts = "delete-products",

  ViewMaterials = "view-materials",
  CreateMaterials = "create-materials",
  UpdateMaterials = "update-materials",
  DeleteMaterials = "delete-materials",

  ViewStaffs = "view-staffs",
  CreateStaffs = "create-staffs",
  UpdateStaffs = "update-staffs",
  DeleteStaffs = "delete-staffs",
  BanStaffs = "ban-staffs",

  ViewBorders = "view-borders",
  CreateBorders = "create-borders",
  UpdateBorders = "update-borders",
  DeleteBorders = "delete-borders",

  ViewToppings = "view-toppings",
  CreateToppings = "create-toppings",
  UpdateToppings = "update-toppings",
  DeleteToppings = "delete-toppings",

  ViewSizes = "view-sizes",
  CreateSizes = "create-sizes",
  UpdateSizes = "update-sizes",
  DeleteSizes = "delete-sizes",

  ViewCategories = "view-categories",
  CreateCategories = "create-categories",
  UpdateCategories = "update-categories",
  DeleteCategories = "delete-categories",

  ViewProviders = "view-providers",
  CreateProviders = "create-providers",
  UpdateProviders = "update-providers",
  DeleteProviders = "delete-providers",

  ViewCoupons = "view-coupons",
  CreateCoupons = "create-coupons",
  UpdateCoupons = "update-coupons",
  DeleteCoupons = "delete-coupons",

  ViewImports = "view-imports",
  CreateImports = "create-imports",
  ReceiveImports = "receive-imports",
  UpdateImports = "update-imports",
  DeleteImports = "delete-imports",
  ApproveImports = "approve-imports",

  ViewOrders = "view-orders",
  UpdateOrders = "update-orders",

  ViewDeliveries = "view-deliveries",
  CreateDeliveries = "create-deliveries",
  UpdateDeliveries = "update-deliveries",
  DeleteDeliveries = "delete-deliveries",

  ViewInventory = "view-inventory",
  ManageInventory = "manage-inventory",
  ManageSettings = "manage-settings",
}

export enum OrderStatus {
  PENDING = "PENDING",
  COOKING = "COOKING",
  COOKED = "COOKED", // Thêm trạng thái đã nấu xong
  SHIPPING = "SHIPPING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type RawActionResult<T extends object = object> = {
  success: boolean;
  error?: string;
  fieldErrors?: T;
  data?: any;
};
export type ActionResultType<T extends object = object> = TypedResponse<
  RawActionResult<T>
>;
export type ParsedActionResult<T extends ZodSchema> = RawActionResult<
  z.ZodError<z.infer<T>>["errors"]
>;
export type ActionZodResponse<T extends ZodSchema> = Promise<
  ActionResultType<z.ZodError<z.infer<T>>["errors"]>
>;
type JsonPrimitive = string | number | boolean | null;
export type Jsonify<T> = T extends JsonPrimitive
  ? T
  : T extends Array<infer U>
    ? Jsonify<U>[]
    : T extends object
      ? { [K in keyof T]: Jsonify<T[K]> }
      : never;
export type ProductWithCategory = Product & {
  category: Category;
  Borders: { border: { name: string } }[];
  Toppings: { topping: { name: string } }[];
  Sizes: { size: { name: string }; price: number }[];
};
export type ToppingWithMaterial = Topping & {
  Material: Material;
};
export type ProductWithRelations = Product & {
  Borders: { borderId: string }[];
  Toppings: { toppingId: string }[];
  Sizes: { sizeId: string; price: number }[];
  Recipes: { materialId: string; quantity: number }[];
};
export interface ProductSectionProps {
  products: (Product & {
    category: { name: string };
    Sizes: { size: { name: string }; price: number }[];
  })[];
}
export type ProductWithDetails = Product & {
  Borders?: ProductBorder &
    {
      border: Border;
    }[];
  Toppings?: ProductTopping &
    {
      topping: Topping;
    }[];
  Sizes: (ProductSize & {
    size: Size;
  })[];
};
export type CartItem = {
  product: ProductWithDetails;
  quantity: number;
  options: {
    sizeId: string;
    borderId?: string;
    toppingId?: string;
  };
};
export type GraphhopperRouteCalculation = {
  hints: {
    "visited_nodes.sum": number;
    "visited_nodes.average": number;
  };
  info: {
    copyrights: [string, string];

    took: 3;
    road_data_timestamp: string;
  };
  paths: {
    distance: number;
    weight: number;
    time: number;
    transfers: number;
    points_encoded: boolean;
    points_encoded_multiplier: number;
    snapped_waypoints: string;
    instructions?: {
      distance: number;
      heading: number;
      sign: number;
      interval: number[];
      text: string;
      time: number;
      street_name: string;
    }[];
  }[];
};
export type OrderWithDetails = Order & {
  OrderDetail: (OrderDetail & {
    product: { name: string; image: string | null };
    size: { name: string };
    border?: { name: string } | null;
    topping?: { name: string } | null;
  })[];
};

export type OrderWithDetailsCustomerCoupon = Order & {
  customer: Customer;
  coupon: Coupon;
  OrderDetail: (OrderDetail & {
    product: Product & { Sizes: ProductSize[] };
    size: { name: string };
    border?: { name: string } | null;
    topping?: { name: string } | null;
  })[];
};
