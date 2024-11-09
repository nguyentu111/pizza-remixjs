import { formatPrice } from "~/lib/utils";
import { motion } from "framer-motion";

type OrderDetailProps = {
  detail: {
    product: {
      name: string;
      image: string | null;
    };
    size: {
      name: string;
    };
    border?: {
      name: string;
    } | null;
    topping?: {
      name: string;
    } | null;
    quantity: number;
    totalAmount: number | string;
  };
  showAllDetails?: boolean;
};

export function OrderDetailItem({
  detail,
  showAllDetails = true,
}: OrderDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 pb-4 border-b"
    >
      <img
        src={detail.product.image || ""}
        alt={detail.product.name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-medium">{detail.product.name}</h3>
        <div className="text-sm text-gray-500 space-y-1">
          {/* Chỉ hiển thị size khi showAllDetails = true */}
          {showAllDetails && <p>Size: {detail.size.name}</p>}
          {detail.border && <p>Viền: {detail.border.name}</p>}
          {detail.topping && <p>Topping: {detail.topping.name}</p>}
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm">Số lượng: {detail.quantity}</span>
          <span className="font-medium">
            {formatPrice(Number(detail.totalAmount))}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
