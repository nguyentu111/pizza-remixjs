import { NavLink } from "@remix-run/react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "usehooks-ts";
import { ProductWithDetails } from "~/lib/type";
import { ProductCard } from "../client/product-card";

export function ProductSection({
  products,
}: {
  products: ProductWithDetails[];
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <div className="mb-8" ref={ref}>
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={isIntersecting ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="flex mb-4"
      >
        <NavLink
          to="?tab=whatToEat"
          className={({ isActive }) =>
            `px-4 py-2 transition-colors ${
              isActive
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`
          }
        >
          Hôm Nay Ăn Gì?
        </NavLink>
        <NavLink
          to="?tab=bestSellers"
          className={({ isActive }) =>
            `px-4 py-2 transition-colors ${
              isActive
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`
          }
        >
          Best Sellers
        </NavLink>
      </motion.nav>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={isIntersecting ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 container mx-auto"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ y: 20, opacity: 0 }}
            animate={isIntersecting ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
