import { Material, Prisma } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertMaterialSchema } from "~/lib/schema";
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
import { useState } from "react";
import { ImageSelector } from "./image-selector";

const unitOptions = ["kg", "g", "ml", "l"];

export const AddOrUpdateMaterialForm = ({
  material,
}: {
  material?: Material;
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [image, setImage] = useState<string | undefined>(
    material?.image ?? undefined,
  );
  const { fetcher, formRef, control } = useForm<typeof insertMaterialSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: material?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...material,
      warningLimits: material?.warningLimits.toString(),
      unit: material?.unit as "kg" | "g" | "ml" | "l" | undefined,
      image: material?.image ?? undefined,
    },
  });

  return (
    <fetcher.Form
      action={
        material?.id
          ? `/admin/materials/${material.id}`
          : "/admin/materials/add"
      }
      method={material?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <div className="flex flex-col space-y-4">
        <ImageSelector
          initialImage={material?.image ?? undefined}
          mediaType="material"
          onImageSelected={setImage}
          placeholderText="Chọn ảnh nguyên liệu"
        />

        <FormField control={control} name="name">
          <Label>Tên nguyên liệu</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="unit">
          <Label>Đơn vị</Label>
          <Select name="unit" defaultValue={material?.unit}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn đơn vị" />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="warningLimits">
          <Label>Giới hạn cảnh báo</Label>
          <InputField type="number" step="0.01" />
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
        {material?.id ? "Cập nhật nguyên liệu" : "Tạo nguyên liệu"}
      </Button>
    </fetcher.Form>
  );
};
