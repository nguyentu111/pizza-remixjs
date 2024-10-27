import { Topping, Material, Prisma } from "@prisma/client";
import { useState } from "react";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertToppingSchema } from "~/lib/schema";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { FormField } from "../shared/form/form-field";
import { Label } from "../ui/label";
import { InputField } from "../shared/form/form-fields/input-field";
import { ErrorMessage } from "../shared/form/error-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ImageSelector } from "./image-selector";

export const AddOrUpdateToppingForm = ({
  topping,
  materials,
}: {
  topping?: Topping;
  materials: Material[];
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [image, setImage] = useState<string | undefined>(
    topping?.image ?? undefined,
  );
  const { fetcher, formRef, control } = useForm<typeof insertToppingSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: topping?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...topping,
      price: topping?.price?.toString(),
      materialId: topping?.materialId ?? undefined,
      image: topping?.image ?? undefined,
    },
  });

  return (
    <fetcher.Form
      action={
        topping?.id ? `/admin/toppings/${topping.id}` : "/admin/toppings/add"
      }
      method={topping?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <div className="flex flex-col space-y-4">
        <ImageSelector
          initialImage={topping?.image ?? undefined}
          mediaType="topping"
          onImageSelected={setImage}
          placeholderText="Chọn ảnh topping"
        />

        <FormField control={control} name="name">
          <Label>Tên topping</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="price">
          <Label>Giá</Label>
          <InputField type="number" step="0.01" />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="materialId">
          <Label>Nguyên liệu</Label>
          <Select
            name="materialId"
            defaultValue={topping?.materialId ?? undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nguyên liệu" />
            </SelectTrigger>
            <SelectContent>
              {materials.map((material) => (
                <SelectItem key={material.id} value={material.id}>
                  {material.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage />
        </FormField>
      </div>

      <input
        value={image ?? ""}
        name="image"
        className="hidden"
        onChange={() => {}}
      />

      <Button type="submit" className="mt-4">
        {topping?.id ? "Cập nhật topping" : "Tạo topping"}
      </Button>
    </fetcher.Form>
  );
};
