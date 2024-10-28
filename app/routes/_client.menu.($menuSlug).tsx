import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, NavLink, useLoaderData, useParams } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { getAllCategories } from "~/models/category.server";
import { getProductByCategorySlug } from "~/models/product.server";

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
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={product.image || "/path-to-placeholder-image.jpg"}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-3 overflow-hidden">
                {product.shortDescription}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  {product.Sizes[0]?.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
                <Link
                  to={`/product/${product.id}`}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
