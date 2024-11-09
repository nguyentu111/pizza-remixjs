import { useModal } from "../providers/modal-provider";
import CustomModal from "../shared/custom-modal";
import ProductOrderModal from "./product-order-modal";
import { ProductWithDetails } from "~/lib/type";

export function ProductCard({ product }: { product: ProductWithDetails }) {
  const { setOpen } = useModal();
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <img
        src={product.image || "/placeholder.jpg"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {product.shortDescription}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            {product.Sizes[0]?.price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
          <button
            onClick={() =>
              setOpen(
                <CustomModal
                  title={product.name}
                  subheading={product.shortDescription}
                  contentClass="w-[95vw] max-w-6xl"
                >
                  <ProductOrderModal product={product} />
                </CustomModal>,
              )
            }
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
