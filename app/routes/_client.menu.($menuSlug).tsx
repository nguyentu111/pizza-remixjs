import { json, LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { getAllCategories } from "~/models/category.server";
import { getProductByCategorySlug } from "~/models/product.server";
import { ProductCard } from "~/components/client/product-card";
import { ProductWithDetails } from "~/lib/type";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const menuSlug = params.menuSlug as string | undefined;
  const categories = await getAllCategories();
  const products = await getProductByCategorySlug(menuSlug as string);

  return json({ categories, products });
};

export default function MenuPage() {
  const { categories, products } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>

      <div className="flex gap-4 flex-wrap">
        {categories.map((category) => (
          <NavLink
            to={`/menu/${category.slug}`}
            key={category.id}
            className={({ isActive }) =>
              cn("px-4 py-2 text-lg", isActive && "bg-red-500 text-white")
            }
          >
            {category.name}
          </NavLink>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product as unknown as ProductWithDetails}
          />
        ))}
      </div>
    </div>
  );
}
