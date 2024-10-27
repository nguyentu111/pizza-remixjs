import { Category, Product, Topping, Material } from "@prisma/client";
import { TypedResponse } from "@remix-run/node";
import { z, ZodSchema } from "zod";

export type RawActionResult<T extends object = object> = {
  success: boolean;
  error?: string;
  fieldErrors?: T;
};
export type ActionResultType<T extends object = object> = TypedResponse<
  RawActionResult<T>
>;
export type ParsedActionResult<T extends ZodSchema> = RawActionResult<
  z.inferFlattenedErrors<T>["fieldErrors"]
>;
export type ActionZodResponse<T extends ZodSchema> = Promise<
  ActionResultType<z.inferFlattenedErrors<T>["fieldErrors"]>
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
