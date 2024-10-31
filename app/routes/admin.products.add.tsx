import { Category, Border, Topping, Size, Material } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateProductForm } from "~/components/admin/add-or-update-product-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertProductSchema } from "~/lib/schema";
import { safeAction } from "~/lib/utils";
import { getAllCategories } from "~/models/category.server";
import { getAllBorders } from "~/models/border.server";
import { getAllToppings } from "~/models/topping.server";
import { getAllSizes } from "~/models/size.server";
import { getAllMaterials } from "~/models/material.server";
import { createProduct, getProductBySlug } from "~/models/product.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };
export const loader = async () => {
  const [categories, borders, toppings, sizes, materials] = await Promise.all([
    getAllCategories(),
    getAllBorders(),
    getAllToppings(),
    getAllSizes(),
    getAllMaterials(),
  ]);

  return {
    categories,
    borders,
    toppings,
    sizes,
    materials,
  };
};

export const action = safeAction([
  {
    method: "POST",
    schema: insertProductSchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertProductSchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateProducts,
      ]);

      const existingProduct = await getProductBySlug(validatedData.slug);
      if (existingProduct) {
        return json(
          { error: "Sản phẩm với slug này đã tồn tại.", success: false },
          { status: 403 },
        );
      }

      await createProduct(
        {
          name: validatedData.name,
          shortDescription: validatedData.shortDescription,
          detailDescription: validatedData.detailDescription ?? null,
          slug: validatedData.slug,
          categoryId: validatedData.categoryId,
          image: validatedData.image ?? null,
          image_mobile: validatedData.image_mobile ?? null,
        },
        {
          borderIds: validatedData["borderIds[]"],
          toppingIds: validatedData["toppingIds[]"],
          sizes: validatedData.sizes?.map(({ sizeId, price }) => ({
            sizeId,
            price: Number(price),
          })),
          recipes: validatedData.recipes?.map(({ materialId, quantity }) => ({
            materialId,
            quantity: Number(quantity),
          })),
        },
      );

      return json({
        success: true,
      });
    },
  },
]);

export default function AddProductPage() {
  const { categories, borders, toppings, sizes, materials } =
    useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm sản phẩm</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/products" className="hover:underline">
              Quản lý sản phẩm
            </a>{" "}
            &gt; Thêm sản phẩm
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateProductForm
          categories={categories as unknown as Category[]}
          borders={borders as unknown as Border[]}
          toppings={toppings as unknown as Topping[]}
          sizes={sizes as unknown as Size[]}
          materials={materials as unknown as Material[]}
        />
      </div>
    </div>
  );
}
