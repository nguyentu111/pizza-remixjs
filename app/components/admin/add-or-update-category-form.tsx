import { Category } from "@prisma/client";
import { useState } from "react";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertCategorySchema } from "~/lib/schema";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { FormField } from "../shared/form/form-field";
import { Label } from "../ui/label";
import { InputField } from "../shared/form/form-fields/input-field";
import { ErrorMessage } from "../shared/form/error-message";
import { ImageSelector } from "./image-selector";

export const AddOrUpdateCategoryForm = ({
  category,
}: {
  category?: Category;
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [image, setImage] = useState<string | undefined>(
    category?.image ?? undefined,
  );
  const { fetcher, formRef, control } = useForm<typeof insertCategorySchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: category?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...category,
      image: category?.image ?? undefined,
    },
  });

  return (
    <fetcher.Form
      action={
        category?.id
          ? `/admin/categories/${category.id}`
          : "/admin/categories/add"
      }
      method={category?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <div className="flex flex-col space-y-4">
        <ImageSelector
          initialImage={category?.image ?? undefined}
          mediaType="category"
          onImageSelected={setImage}
          placeholderText="Chọn ảnh danh mục"
        />

        <FormField control={control} name="name">
          <Label>Tên danh mục</Label>
          <InputField />
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
        {category?.id ? "Cập nhật danh mục" : "Tạo danh mục"}
      </Button>
    </fetcher.Form>
  );
};
