import { Size } from "@prisma/client";
import { useState } from "react";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertSizeSchema } from "~/lib/schema";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { FormField } from "../shared/form/form-field";
import { Label } from "../ui/label";
import { InputField } from "../shared/form/form-fields/input-field";
import { ErrorMessage } from "../shared/form/error-message";
import { ImageSelector } from "./image-selector";

export const AddOrUpdateSizeForm = ({ size }: { size?: Size }) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [image, setImage] = useState<string | undefined>(
    size?.image ?? undefined,
  );
  const { fetcher, formRef, control } = useForm<typeof insertSizeSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: size?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...size,
      image: size?.image ?? undefined,
    },
  });

  return (
    <fetcher.Form
      action={size?.id ? `/admin/sizes/${size.id}` : "/admin/sizes/add"}
      method={size?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <div className="flex flex-col space-y-4">
        <ImageSelector
          initialImage={size?.image ?? undefined}
          mediaType="size"
          onImageSelected={setImage}
          placeholderText="Chọn ảnh kích thước"
        />

        <FormField control={control} name="name">
          <Label>Tên kích thước</Label>
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
        {size?.id ? "Cập nhật kích thước" : "Tạo kích thước"}
      </Button>
    </fetcher.Form>
  );
};
