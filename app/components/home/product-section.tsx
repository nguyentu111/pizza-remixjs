import { Product } from "@prisma/client";
import { NavLink } from "@remix-run/react";
import { ProductSectionProps, ProductWithDetails } from "~/lib/type";
import { ProductCard } from "../client/product-card";

export function ProductSection({
  products,
}: {
  products: ProductWithDetails[];
}) {
  return (
    <div className="mb-8">
      <nav className="flex mb-4">
        <NavLink
          to="?tab=whatToEat"
          className={({ isActive }) =>
            `px-4 py-2 ${
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
            `px-4 py-2 ${
              isActive
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`
          }
        >
          Best Sellers
        </NavLink>
      </nav>
      <ProductGrid products={products} />
    </div>
  );
}
const ProductGrid = ({ products }: { products: ProductWithDetails[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 container mx-auto">
    {products.map((product) => (
      <ProductCard product={product} />
    ))}
  </div>
);
