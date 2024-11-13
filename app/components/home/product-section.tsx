import { NavLink, useSearchParams, useNavigate } from "@remix-run/react";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    navigate(`?${newParams.toString()}`, {
      replace: true,
      preventScrollReset: true,
    });
  };
  return (
    <div className="mb-8" ref={ref}>
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={isIntersecting ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="flex mb-4 mx-auto w-full justify-center"
      >
        <div
          onClick={() => updateSearchParam("tab", "whatToEat")}
          className={`px-4 py-2 transition-colors ${
            searchParams.get("tab") === "whatToEat"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
          }`}
        >
          Hôm Nay Ăn Gì?
        </div>
        <div
          onClick={() => updateSearchParam("tab", "bestSellers")}
          className={`px-4 py-2 transition-colors ${
            searchParams.get("tab") === "bestSellers"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
          }`}
        >
          Bán chạy nhất
        </div>
      </motion.nav>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={isIntersecting ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 container mx-auto"
      >
        {products.map((product, index) => (
          <motion.div
            key={`${product.id}-${searchParams.toString()}`}
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
