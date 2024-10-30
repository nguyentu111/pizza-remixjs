import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateCategoryForm } from "~/components/admin/add-or-update-category-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { insertCategorySchema } from "~/lib/schema";
import { safeAction, slugify } from "~/lib/utils";
import {
  createCategory,
  getCategoryBySlug,
  getCategoryByName,
} from "~/models/category.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const action = safeAction([
  {
    method: "POST",
    schema: insertCategorySchema,
    action: async ({ request }, data) => {
      const validatedData = data as z.infer<typeof insertCategorySchema>;
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreateCategories,
      ]);

      // Check if a category with the same name already exists
      const existingCategoryByName = await getCategoryByName(
        validatedData.name,
      );
      if (existingCategoryByName) {
        return json(
          { error: "Danh mục với tên này đã tồn tại.", success: false },
          { status: 400 },
        );
      }

      // Generate slug from the namea
      let slug = slugify(validatedData.name);
      let existingCategory = await getCategoryBySlug(slug);
      let counter = 1;

      // If a category with this slug already exists, append a number to make it unique
      while (existingCategory) {
        slug = `${slugify(validatedData.name)}-${counter}`;
        existingCategory = await getCategoryBySlug(slug);
        counter++;
      }

      await createCategory({
        name: validatedData.name,
        slug: slug,
        image: validatedData.image ?? "",
      });
      return json({
        success: true,
      });
    },
  },
]);

export default function AddCategoryPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Thêm danh mục</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/categories" className="hover:underline">
              Quản lý danh mục
            </a>{" "}
            &gt; Thêm danh mục
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateCategoryForm />
      </div>
    </div>
  );
}
