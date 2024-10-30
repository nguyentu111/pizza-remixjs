import {
  Product,
  Category,
  Border,
  Topping,
  Size,
  Material,
} from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertProductSchema } from "~/lib/schema";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { FormField } from "../shared/form/form-field";
import { InputField } from "../shared/form/form-fields/input-field";
import { ErrorMessage } from "../shared/form/error-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TextareaField } from "../shared/form/form-fields/text-area-field";
import { ImageSelector } from "./image-selector";
import { ProductWithRelations } from "~/lib/type";

export const AddOrUpdateProductForm = ({
  product,
  categories,
  borders,
  toppings,
  sizes,
  materials,
}: {
  product?: ProductWithRelations;
  categories: Category[];
  borders: Border[];
  toppings: Topping[];
  sizes: Size[];
  materials: Material[];
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const { fetcher, formRef, control } = useForm<typeof insertProductSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: product?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...product,
      categoryId: product?.categoryId ?? "",
      detailDescription: product?.detailDescription ?? undefined,
      image: product?.image ?? undefined,
      image_mobile: product?.image_mobile ?? undefined,
    },
  });

  const [selectedSizes, setSelectedSizes] = useState<
    { id: string; price: number }[]
  >(product?.Sizes.map((s) => ({ id: s.sizeId, price: s.price })) ?? []);

  const [selectedMaterials, setSelectedMaterials] = useState<
    { id: string; quantity: number }[]
  >(
    product?.Recipes.map((r) => ({ id: r.materialId, quantity: r.quantity })) ??
      [],
  );

  const [image, setImage] = useState<string | undefined>(
    product?.image ?? undefined,
  );
  const [imageMobile, setImageMobile] = useState<string | undefined>(
    product?.image_mobile ?? undefined,
  );

  return (
    <fetcher.Form
      action={
        product?.id ? `/admin/products/${product.id}` : "/admin/products/add"
      }
      method={product?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <ImageSelector
            initialImage={product?.image ?? undefined}
            mediaType="product"
            onImageSelected={setImage}
            placeholderText="Chọn ảnh sản phẩm"
          />

          <ImageSelector
            initialImage={product?.image_mobile ?? undefined}
            mediaType="product_mobile"
            onImageSelected={setImageMobile}
            placeholderText="Chọn ảnh sản phẩm (mobile)"
          />
        </div>
        <FormField control={control} name="name">
          <Label>Tên sản phẩm</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="shortDescription">
          <Label>Mô tả ngắn</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="detailDescription">
          <Label>Mô tả chi tiết</Label>
          <TextareaField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="slug">
          <Label>Slug</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="categoryId">
          <Label>Danh mục</Label>
          <Select name="categoryId" defaultValue={product?.categoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage />
        </FormField>

        <div>
          <Label>Viền</Label>
          <div className="flex flex-wrap gap-4">
            {borders.map((border) => (
              <div key={border.id} className="flex items-center">
                <Checkbox
                  id={`border-${border.id}`}
                  name="borderIds[]"
                  value={border.id}
                  defaultChecked={
                    !!product?.Borders.find((b) => b.borderId === border.id)
                  }
                />
                <Label htmlFor={`border-${border.id}`} className="ml-2">
                  {border.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Topping</Label>
          <div className="flex flex-wrap gap-4">
            {toppings.map((topping) => (
              <div key={topping.id} className="flex items-center">
                <Checkbox
                  id={`topping-${topping.id}`}
                  name="toppingIds[]"
                  value={topping.id}
                  defaultChecked={
                    !!product?.Toppings.find((t) => t.toppingId === topping.id)
                  }
                />
                <Label htmlFor={`topping-${topping.id}`} className="ml-2">
                  {topping.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Kích thước và giá</Label>
          {sizes.map((size, index) => (
            <div key={size.id} className="flex items-center space-x-2 mt-2">
              <Checkbox
                name={`sizes[${index}].sizeId`}
                value={size.id}
                id={`size-${size.id}`}
                checked={selectedSizes.some((s) => s.id === size.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSizes([
                      ...selectedSizes,
                      { id: size.id, price: 0 },
                    ]);
                  } else {
                    setSelectedSizes(
                      selectedSizes.filter((s) => s.id !== size.id),
                    );
                  }
                }}
              />
              <Label htmlFor={`size-${size.id}`}>{size.name}</Label>
              {selectedSizes.some((s) => s.id === size.id) && (
                <InputField
                  type="number"
                  name={`sizes[${index}].price`}
                  value={
                    selectedSizes.find((s) => s.id === size.id)?.price || 0
                  }
                  onChange={(e) => {
                    const newPrice = parseInt(e.target.value);
                    setSelectedSizes(
                      selectedSizes.map((s) =>
                        s.id === size.id ? { ...s, price: newPrice } : s,
                      ),
                    );
                  }}
                  placeholder="Giá"
                />
              )}
            </div>
          ))}
        </div>

        <div>
          <Label>Công thức</Label>
          {materials.map((material, index) => (
            <div key={material.id} className="flex items-center space-x-2 mt-2">
              <Checkbox
                id={`recipes[${index}].materialId`}
                name={`recipes[${index}].materialId`}
                value={material.id}
                checked={selectedMaterials.some((m) => m.id === material.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMaterials([
                      ...selectedMaterials,
                      { id: material.id, quantity: 0 },
                    ]);
                  } else {
                    setSelectedMaterials(
                      selectedMaterials.filter((m) => m.id !== material.id),
                    );
                  }
                }}
              />
              <Label htmlFor={`recipes[${index}].materialId`}>
                {material.name}
              </Label>
              {selectedMaterials.some((m) => m.id === material.id) && (
                <InputField
                  id={`recipes[${index}].quantity`}
                  type="number"
                  name={`recipes[${index}].quantity`}
                  value={
                    selectedMaterials.find((m) => m.id === material.id)
                      ?.quantity || 0
                  }
                  onChange={(e) => {
                    const newQuantity = parseFloat(e.target.value);
                    setSelectedMaterials(
                      selectedMaterials.map((m) =>
                        m.id === material.id
                          ? { ...m, quantity: newQuantity }
                          : m,
                      ),
                    );
                  }}
                  placeholder="Số lượng"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <input
        value={image ?? ""}
        name="image"
        className="hidden"
        onChange={() => {}}
      />

      <input
        value={imageMobile ?? ""}
        name="image_mobile"
        className="hidden"
        onChange={() => {}}
      />

      <Button type="submit" className="mt-4">
        {product?.id ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
      </Button>
    </fetcher.Form>
  );
};
