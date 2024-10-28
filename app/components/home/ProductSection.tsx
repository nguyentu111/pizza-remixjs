import { Product } from "@prisma/client";
import { NavLink } from "@remix-run/react";
import { ProductSectionProps } from "~/lib/type";

export function ProductSection({ products }: ProductSectionProps) {
  const ProductGrid = ({
    products,
  }: {
    products: ProductSectionProps["products"];
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 container mx-auto">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4">
          <img
            src={product.image || "/path-to-placeholder-image.jpg"}
            alt={product.name}
            className="w-full h-48 object-cover mb-4"
          />
          <h3 className="font-bold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-2">{product.shortDescription}</p>
          <p className="font-bold mb-2">
            {product.Sizes[0]?.price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
          <NavLink
            to={`/product/${product.id}`}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition block text-center"
          >
            Order Now
          </NavLink>
        </div>
      ))}
    </div>
  );

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
