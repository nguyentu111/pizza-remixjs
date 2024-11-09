import { Link } from "@remix-run/react";
import { Edit2Icon, ShoppingCart, Trash2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "~/lib/utils";
import { useCart } from "../providers/cart-provider";
import { useModal } from "../providers/modal-provider";
import CustomModal from "../shared/custom-modal";
import ProductOrderModal from "./product-order-modal";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { CartItem } from "~/lib/type";
import { useState } from "react";

export function CartSheet() {
  const {
    items: cartItems,
    removeItem,
    calculateItemPrice,
    calculateTotal,
  } = useCart();
  const [openSheet, setOpenSheet] = useState(false);
  const { setOpen } = useModal();

  const editItem = async (item: CartItem) => {
    console.log(item.product.id);
    const product = await fetch(`/api/product/${item.product.id}`)
      .then((res) => res.json())
      .then((data) => data.product);
    setOpen(
      <CustomModal
        title={item.product.name}
        subheading="Chỉnh sửa sản phẩm"
        contentClass="w-[95vw] max-w-6xl"
      >
        <ProductOrderModal editData={item} product={product} />
      </CustomModal>,
    );
  };

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6 text-white" />
          <AnimatePresence>
            {cartItems.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                {cartItems.length}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Giỏ hàng của bạn</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-6">
          <AnimatePresence>
            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center text-gray-500"
              >
                Giỏ hàng trống
              </motion.div>
            ) : (
              <>
                <motion.div
                  layout
                  className="space-y-4 max-h-[70vh] overflow-y-auto"
                >
                  {cartItems.map((item, index) => (
                    <motion.div
                      layout
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <img
                        src={item.product.image ?? undefined}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editItem(item)}
                            >
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          {item.product.Sizes.length > 1 &&
                            item.options.sizeId && (
                              <p>
                                Size:{" "}
                                {
                                  item.product.Sizes.find(
                                    (s) => s.size.id === item.options.sizeId,
                                  )?.size.name
                                }
                              </p>
                            )}
                          {item.options.borderId && (
                            <p>
                              Viền:{" "}
                              {
                                item.product.Borders?.find(
                                  (b) => b.border.id === item.options.borderId,
                                )?.border.name
                              }
                            </p>
                          )}
                          {item.options.toppingId && (
                            <p>
                              Topping:{" "}
                              {
                                item.product.Toppings?.find(
                                  (t) =>
                                    t.topping.id === item.options.toppingId,
                                )?.topping.name
                              }
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span>Số lượng: {item.quantity}</span>
                          <span className="font-semibold">
                            {formatPrice(calculateItemPrice(item))}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div layout className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    asChild
                    onClick={() => setOpenSheet(false)}
                  >
                    <Link to="/checkout">Thanh toán</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
