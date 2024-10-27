import { Category } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateCategoryForm } from "~/components/admin/add-or-update-category-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { insertCategorySchema } from "~/lib/schema";
import { safeAction, slugify } from "~/lib/utils";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryByName,
  getCategoryBySlug,
} from "~/models/category.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const categoryId = params.categoryId;
  if (!categoryId) {
    throw new Response("Not Found", { status: 404 });
  }
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ category });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: insertCategorySchema,
    action: async ({ request, params }, data) => {
      const categoryId = params.categoryId;
      if (!categoryId) {
        return json(
          { error: "Category ID is required", success: false },
          { status: 400 },
        );
      }
      const validatedData = data as z.infer<typeof insertCategorySchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.UpdateCategories,
      ]);

      // Check if the new name already exists for another category
      const existingCategoryByName = await getCategoryByName(
        validatedData.name,
      );
      if (existingCategoryByName && existingCategoryByName.id !== categoryId) {
        return json(
          { error: "Danh mục với tên này đã tồn tại.", success: false },
          { status: 400 },
        );
      }

      // Generate new slug
      let slug = slugify(validatedData.name);
      let existingCategory = await getCategoryBySlug(slug);
      let counter = 1;

      // If a category with this slug already exists (and it's not the current category), append a number to make it unique
      while (existingCategory && existingCategory.id !== categoryId) {
        slug = `${slugify(validatedData.name)}-${counter}`;
        existingCategory = await getCategoryBySlug(slug);
        counter++;
      }

      await updateCategory(categoryId, {
        name: validatedData.name,
        slug: slug,
        image: validatedData.image ?? undefined,
      });
      return json({ success: true });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const categoryId = params.categoryId;
      if (!categoryId) {
        return json(
          { error: "Category ID is required", success: false },
          { status: 400 },
        );
      }
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeleteCategories,
      ]);

      await deleteCategory(categoryId);
      return json({ success: true });
    },
  },
]);

export default function UpdateCategoryPage() {
  const { category } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật danh mục</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/categories" className="hover:underline">
              Quản lý danh mục
            </a>{" "}
            &gt; Cập nhật danh mục
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateCategoryForm category={category as unknown as Category} />
      </div>
    </div>
  );
}
