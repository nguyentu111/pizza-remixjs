import { useState } from "react";
import { useModal } from "../providers/modal-provider";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { CartItem, ProductWithDetails } from "~/lib/type";
import { MinusIcon, PlusIcon } from "lucide-react";
import { formatPrice } from "~/lib/utils";
import { useCart } from "../providers/cart-provider";

export default function ProductOrderModal({
  isEditing = false,
}: {
  isEditing?: boolean;
}) {
  const { data, setClose } = useModal();
  const { addItem, updateItem, items } = useCart();
  const product = data.product as ProductWithDetails;
  const editData = data.item as CartItem | undefined;
  console.log({ product, editData, isEditing });
  const [selectedOptions, setSelectedOptions] = useState<CartItem["options"]>({
    borderId: editData?.options.borderId,
    sizeId: editData?.options.sizeId,
    toppingId: editData?.options.toppingId,
  });
  const [quantity, setQuantity] = useState(editData?.quantity || 1);

  if (!product) return null;

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
    const selectedBorder = product.Borders.find(
      (b) => b.border.id === selectedOptions.borderId,
    );
    if (selectedBorder) {
      total += selectedBorder.border.price;
    }

    // Add topping price
    const selectedTopping = product.Toppings.find(
      (t) => t.topping.id === selectedOptions.toppingId,
    );
    if (selectedTopping && selectedTopping.topping.price) {
      total += selectedTopping.topping.price;
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: product.id,
      quantity,
      slug: product.slug,
      name: product.name,
      image: product.image || "",
      options: {
        borderId: selectedOptions.borderId,
        sizeId: selectedOptions.sizeId,
        toppingId: selectedOptions.toppingId,
        borderName: product.Borders.find(
          (b) => b.border.id === selectedOptions.borderId,
        )?.border.name,
        sizeName: product.Sizes.find((s) => s.sizeId === selectedOptions.sizeId)
          ?.size.name,
        borderPrice: product.Borders.find(
          (b) => b.border.id === selectedOptions.borderId,
        )?.border.price,
        sizePrice: product.Sizes.find(
          (s) => s.sizeId === selectedOptions.sizeId,
        )?.price,
        toppingName: product.Toppings.find(
          (t) => t.topping.id === selectedOptions.toppingId,
        )?.topping.name,
        toppingPrice:
          product.Toppings.find(
            (t) => t.topping.id === selectedOptions.toppingId,
          )?.topping.price ?? undefined,
      },
    };

    if (isEditing && editData) {
      // Find the index of the item being edited
      const editIndex = items.findIndex(
        (item) =>
          item.slug === editData.slug &&
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
        <div className="aspect-video relative">
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className="w-[332px] object-cover rounded-lg"
          />
        </div>

        <div className="prose max-w-none">
          <p>{product.detailDescription}</p>
        </div>
      </div>

      <div>
        <div className="space-y-4">
          {/* Size Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Kích thước</h3>
            <RadioGroup
              value={selectedOptions.sizeId}
              onValueChange={(value) =>
                setSelectedOptions((prev) => ({ ...prev, sizeId: value }))
              }
            >
              <div className="grid grid-cols-2 gap-4">
                {product.Sizes.map((size) => (
                  <Label key={size.sizeId} htmlFor={`size-${size.sizeId}`}>
                    <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary">
                      <div className="flex items-center space-x-2">
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
          </div>

          {/* Border Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Viền bánh</h3>
            <RadioGroup
              value={selectedOptions.borderId}
              onValueChange={(value) =>
                setSelectedOptions((prev) => ({ ...prev, borderId: value }))
              }
            >
              <div className="grid grid-cols-2 gap-4">
                {product.Borders.map((border) => (
                  <Label
                    key={border.border.id}
                    htmlFor={`border-${border.border.id}`}
                  >
                    <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={border.border.id}
                          id={`border-${border.border.id}`}
                          defaultChecked={
                            isEditing &&
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
          </div>

          {/* Topping Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Topping</h3>
            <RadioGroup
              value={selectedOptions.toppingId}
              onValueChange={(value) =>
                setSelectedOptions((prev) => ({ ...prev, toppingId: value }))
              }
            >
              <div className="grid grid-cols-2 gap-4">
                {product.Toppings.map((topping) => (
                  <Label
                    htmlFor={`topping-${topping.topping.id}`}
                    key={topping.topping.id}
                  >
                    <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={topping.topping.id}
                          id={`topping-${topping.topping.id}`}
                          defaultChecked={
                            isEditing &&
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
          </div>

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

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-lg font-semibold">
            Tổng tiền: {formatPrice(calculateTotalPrice())}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedOptions.sizeId}
            >
              {isEditing ? "Cập nhật" : "Thêm vào giỏ hàng"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
