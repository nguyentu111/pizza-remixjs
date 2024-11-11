import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateProductForm } from "~/components/admin/add-or-update-product-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertProductSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "~/models/product.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { getAllCategories } from "~/models/category.server";
import { getAllBorders } from "~/models/border.server";
import { getAllToppings } from "~/models/topping.server";
import { getAllSizes } from "~/models/size.server";
import { getAllMaterials } from "~/models/material.server";
import { Border, Category, Material, Size, Topping } from "@prisma/client";
import { ProductWithRelations } from "~/lib/type";

export { ErrorBoundary };

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await requireStaffId(request);
  await requirePermissions(prisma, user, [PermissionsEnum.UpdateProducts]);
  const product = await getProductById(prisma, params.productId!);
  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }
  const [categories, borders, toppings, sizes, materials] = await Promise.all([
    getAllCategories(),
    getAllBorders(),
    getAllToppings(),
    getAllSizes(),
    getAllMaterials(),
  ]);
  return json({ product, categories, borders, toppings, sizes, materials });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertProductSchema,
    action: async ({ request, params }, data) => {
      const validatedData = data as z.infer<typeof insertProductSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateProducts,
      ]);

      await updateProduct(
        params.productId!,
        {
          name: validatedData.name,
          shortDescription: validatedData.shortDescription,
          detailDescription: validatedData.detailDescription,
          slug: validatedData.slug,
          categoryId: validatedData.categoryId,
          image: validatedData.image ?? null,
          image_mobile: validatedData.image_mobile ?? null,
        },
        {
          borderIds: validatedData.borderIds,
          toppingIds: validatedData.toppingIds,
          sizes: validatedData.sizes?.map((size) => ({
            sizeId: size.sizeId,
            price: Number(size.price),
          })),
          recipes: validatedData.recipes?.map((recipe) => ({
            materialId: recipe.materialId,
            quantity: Number(recipe.quantity),
          })),
        },
      );
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    schema: z.object({}),
    action: async ({ request, params }) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteProducts,
      ]);

      await deleteProduct(params.productId!);
      return json({ success: true });
    },
  },
]);

export default function UpdateProductPage() {
  const { product, categories, borders, toppings, sizes, materials } =
    useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật sản phẩm</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/products" className="hover:underline">
              Quản lý sản phẩm
            </a>{" "}
            &gt; Cập nhật sản phẩm
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateProductForm
          product={product as unknown as ProductWithRelations}
          categories={categories as unknown as Category[]}
          borders={borders as unknown as Border[]}
          toppings={toppings as unknown as Topping[]}
          sizes={sizes as unknown as Size[]}
          materials={materials as unknown as Material[]}
        />
      </div>
    </>
  );
}
