import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
  NavLink,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { cn } from "~/lib/utils";
import { getAllCategories } from "~/models/category.server";
import { getProductByCategorySlug } from "~/models/product.server";
import { ProductCard } from "~/components/client/product-card";
import { ProductWithDetails } from "~/lib/type";
import { motion } from "framer-motion";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const menuSlug = params.menuSlug as string | undefined;
  const categories = await getAllCategories();
  const products = await getProductByCategorySlug(menuSlug as string);

  return json({ categories, products });
};

export default function MenuPage() {
  const params = useParams();
  const { categories, products } = useLoaderData<typeof loader>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 pb-8 pt-16"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6"
      >
        Thực Đơn
      </motion.h1>

      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex gap-4 flex-wrap"
      >
        {categories.map((category) => (
          <NavLink
            replace
            preventScrollReset
            to={`/menu/${category.slug}`}
            key={category.id}
            className={({ isActive }) =>
              cn(
                "px-4 py-2 text-lg transition-colors",
                isActive && "bg-red-500 text-white rounded-md",
              )
            }
          >
            {category.name}
          </NavLink>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {products.map((product, index) => (
          <motion.div
            key={`${product.id}-${params.menuSlug}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product as unknown as ProductWithDetails} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
