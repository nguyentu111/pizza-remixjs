import { useState, useEffect } from "react";
import { useModal } from "../providers/modal-provider";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { CartItem, ProductWithDetails } from "~/lib/type";
import { MinusIcon, PlusIcon } from "lucide-react";
import { formatPrice } from "~/lib/utils";
import { useCart } from "../providers/cart-provider";
import { motion } from "framer-motion";

export default function ProductOrderModal({
  product,
  editData,
}: {
  isEditing?: boolean;
  product: ProductWithDetails;
  editData?: CartItem;
}) {
  const { setClose } = useModal();
  const { addItem, updateItem, items } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<
    Pick<CartItem["options"], "borderId" | "sizeId" | "toppingId">
  >(() => ({
    borderId: editData?.options.borderId,
    sizeId: editData?.options.sizeId || product.Sizes[0].sizeId,
    toppingId: editData?.options.toppingId,
  }));

  const [quantity, setQuantity] = useState(editData?.quantity || 1);

  // Initialize default size if there's only one size available
  useEffect(() => {
    if (product.Sizes.length === 1 && !selectedOptions.sizeId) {
      setSelectedOptions((prev) => ({
        ...prev,
        sizeId: product.Sizes[0].sizeId,
      }));
    }
  }, [product.Sizes, selectedOptions.sizeId]);

  const showSizeSection = product.Sizes.length > 1;
  const showBorderSection = product?.Borders
    ? product?.Borders?.length > 0
    : false;
  const showToppingSection = product?.Toppings
    ? product?.Toppings?.length > 0
    : false;

  const calculateTotalPrice = () => {
    let total = 0;

    // Add size price
    const selectedSize = product.Sizes.find(
      (s) => s.sizeId === selectedOptions.sizeId,
    );
    if (selectedSize) {
      total += selectedSize.price;
    }

    // Add border price
    const selectedBorder = product?.Borders?.find(
      (b) => b.border.id === selectedOptions.borderId,
    );
    if (selectedBorder) {
      total += selectedBorder.border.price;
    }

    // Add topping price
    const selectedTopping = product?.Toppings?.find(
      (t) => t.topping.id === selectedOptions.toppingId,
    );
    if (selectedTopping && selectedTopping.topping.price) {
      total += selectedTopping.topping.price;
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      product,
      quantity,
      options: {
        borderId: selectedOptions.borderId,
        sizeId: selectedOptions.sizeId,
        toppingId: selectedOptions.toppingId,
      },
    };

    if (editData) {
      // Find the index of the item being edited
      const editIndex = items.findIndex(
        (item) =>
          item.product.id === editData.product.id &&
          item.options.sizeId === editData.options.sizeId &&
          item.options.borderId === editData.options.borderId &&
          item.options.toppingId === editData.options.toppingId,
      );

      if (editIndex > -1) {
        updateItem(editIndex, cartItem);
      }
    } else {
      addItem(cartItem);
    }

    setClose();
  };

  return (
    <div className="gap-4 md:gap-6 p-4 flex flex-col md:flex-row">
      <div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-video relative max-h-[200px]"
        >
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className="w-[332px] object-cover rounded-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose max-w-none mt-4"
        >
          <p>{product.detailDescription}</p>
        </motion.div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          {/* Size Selection - Only show if there's more than one size */}
          {showSizeSection && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-semibold mb-2">Kích thước</h3>
              <RadioGroup
                value={selectedOptions.sizeId}
                onValueChange={(value) =>
                  setSelectedOptions((prev) => ({ ...prev, sizeId: value }))
                }
              >
                <div className="flex flex-wrap gap-4">
                  {product.Sizes.map((size, index) => (
                    <Label key={size.sizeId} htmlFor={`size-${size.sizeId}`}>
                      <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value={size.sizeId}
                            id={`size-${size.sizeId}`}
                          />
                          {size.size.name} - {formatPrice(size.price)}
                        </div>
                        {size.size.image && (
                          <img
                            src={size.size.image}
                            alt={size.size.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </motion.div>
          )}

          {/* Border Selection - Only show if borders exist */}
          {showBorderSection && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-2">Viền bánh</h3>
              <RadioGroup
                value={selectedOptions.borderId}
                onValueChange={(value) =>
                  setSelectedOptions((prev) => ({ ...prev, borderId: value }))
                }
              >
                <div className="flex flex-wrap gap-4">
                  {product?.Borders?.map((border) => (
                    <Label
                      key={border.border.id}
                      htmlFor={`border-${border.border.id}`}
                    >
                      <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value={border.border.id}
                            id={`border-${border.border.id}`}
                            defaultChecked={
                              editData?.options.borderId === border.border.id
                            }
                          />
                          <span>
                            {border.border.name} -{" "}
                            {formatPrice(border.border.price)}
                          </span>
                        </div>
                        {border.border.image && (
                          <img
                            src={border.border.image}
                            alt={border.border.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </motion.div>
          )}

          {/* Topping Selection - Only show if toppings exist */}
          {showToppingSection && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-2">Topping</h3>
              <RadioGroup
                value={selectedOptions.toppingId}
                onValueChange={(value) =>
                  setSelectedOptions((prev) => ({ ...prev, toppingId: value }))
                }
              >
                <div className="flex flex-wrap gap-4">
                  {product?.Toppings?.map((topping) => (
                    <Label
                      htmlFor={`topping-${topping.topping.id}`}
                      key={topping.topping.id}
                    >
                      <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value={topping.topping.id}
                            id={`topping-${topping.topping.id}`}
                            defaultChecked={
                              editData?.options.toppingId === topping.topping.id
                            }
                          />
                          {topping.topping.name} -{" "}
                          {formatPrice(topping.topping.price || 0)}
                        </div>
                        {topping.topping.image && (
                          <img
                            src={topping.topping.image}
                            alt={topping.topping.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </motion.div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <Label>Số lượng:</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 gap-4 border-t">
          <div className="text-lg font-semibold">
            Tổng tiền: <br /> {formatPrice(calculateTotalPrice())}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedOptions.sizeId}
            >
              {editData ? "Cập nhật" : "Thêm vào giỏ hàng"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
