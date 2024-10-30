import { Link } from "@remix-run/react";
import { useOptionalCustomer } from "~/hooks/use-optional-customer";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ShoppingCart, Edit2Icon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "~/lib/utils";
import { useModal } from "./providers/modal-provider";
import ProductOrderModal from "./client/product-order-modal";
import CustomModal from "./shared/custom-modal";
import { CartItem } from "~/lib/type";
import { useCart } from "./providers/cart-provider";

export function Header() {
  const customer = useOptionalCustomer();
  const {
    items: cartItems,
    removeItem,
    calculateItemPrice,
    calculateTotal,
  } = useCart();
  const { setOpen } = useModal();

  const editItem = async (item: CartItem) => {
    setOpen(
      <CustomModal title={item.name} subheading="Chỉnh sửa sản phẩm">
        <ProductOrderModal isEditing />
      </CustomModal>,
      async () => ({
        product: await fetch(`/api/product/${item.slug}`)
          .then((res) => res.json())
          .then((data) => data.product),
        item,
      }),
    );
  };

  return (
    <header className="bg-blue-900 text-white p-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Domino's Pizza
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/coupons">KHUYẾN MÃI</Link>
            </li>
            <li>
              <Link to="/menu">THỰC ĐƠN</Link>
            </li>
            <li>
              <Link to="/order">THEO DÕI ĐƠN</Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/account" className="text-xl">
            👤 {customer?.phoneNumbers}
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-6 w-6 text-white" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Giỏ hàng của bạn</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Giỏ hàng trống
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      {cartItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 border rounded-lg"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{item.name}</h3>
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
                              <p>Size: {item.options.sizeName}</p>
                              {item.options.borderName && (
                                <p>Viền: {item.options.borderName}</p>
                              )}
                              {item.options.toppingName && (
                                <p>Topping: {item.options.toppingName}</p>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span>Số lượng: {item.quantity}</span>
                              <span className="font-semibold">
                                {formatPrice(calculateItemPrice(item))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold mb-4">
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                      <Button className="w-full" size="lg" asChild>
                        <Link to="/checkout">Thanh toán</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
